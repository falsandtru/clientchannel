import { Channel, ChannelMessage } from '../broadcast/channel';
import { AtomicPromise } from 'spica/promise';

declare global {
  interface ChannelMessageTypeMap<K extends string> {
    ownership: OwnershipMessage<K>;
  }
}

class OwnershipMessage<K extends string> extends ChannelMessage<K> {
  constructor(
    public readonly key: K,
    public readonly priority: number,
  ) {
    super(key, 'ownership');
  }
}

export class Ownership<K extends string> {
  private static readonly mergin = 5 * 1000;
  private static genPriority(age: number): number {
    return Date.now() + age;
  }
  constructor(
    private readonly channel: Channel<K>,
  ) {
    void this.channel.listen('ownership', ({ key, priority }) => {
      assert(priority > 0);
      if (this.has(key) && this.getPriority(key) < priority - Ownership.mergin) {
        // Reply my priority if I have ownership and the min priority.
        void this.castPriority(key);
      }
      else {
        // Extend my foreign priority as long as possible.
        void this.setPriority(key, Math.min(-priority, this.getPriority(key)));
      }
    });
  }
  private readonly store: Map<K, number> = new Map();
  private getPriority(key: K): number {
    if (!this.store.has(key)) {
      // Initial processing.
      // Request replies of foreign priority.
      void this.setPriority(key, Math.max(Ownership.genPriority(0) - Ownership.mergin, 0));
      // Wait replies.
      void this.setPriority(key, -Ownership.genPriority(Ownership.mergin));
    }
    assert(this.store.has(key));
    return this.store.get(key)!;
  }
  private setPriority(key: K, priority: number): void {
    assert(Math.abs(priority) < 1e15);
    // Don't send the same priority repeatedly.
    if (this.store.has(key) && priority === this.getPriority(key)) return;
    // Add randomness.
    void this.store.set(key, priority + Math.floor(Math.random() * 1 * 1000));
    void this.castPriority(key);
  }
  private castPriority(key: K): void {
    if (this.getPriority(key) < 0) return;
    if (!this.isTakable(key)) return;
    assert(this.getPriority(key) > 0);
    void this.channel.post(new OwnershipMessage(key, this.getPriority(key) + Ownership.mergin));
  }
  private has(key: K): boolean {
    return this.getPriority(key) >= Ownership.genPriority(0);
  }
  private isTakable(key: K): boolean {
    return this.getPriority(key) > 0
        || Ownership.genPriority(0) > Math.abs(this.getPriority(key));
  }
  public take(key: K, age: number): boolean
  public take(key: K, age: number, wait: number): AtomicPromise<void>
  public take(key: K, age: number, wait?: number): boolean | AtomicPromise<void> {
    assert(0 <= age && age < 60 * 1000);
    age = Math.min(Math.max(age, 1 * 1000), 60 * 1000) + 100;
    wait = wait === void 0 ? wait : Math.max(wait, 0);
    if (!this.isTakable(key)) return false;
    void this.setPriority(key, Math.max(Ownership.genPriority(age + (wait || 0)), this.getPriority(key)));
    return wait === void 0
      ? true
      : new AtomicPromise(resolve => setTimeout(resolve, wait))
          .then(() =>
            this.extend(key, age)
              ? AtomicPromise.resolve()
              : AtomicPromise.reject());
  }
  public extend(key: K, age: number): boolean {
    return this.has(key)
      ? this.take(key, age)
      : false;
  }
  public close(): void {
    void this.channel.close();
  }
}
