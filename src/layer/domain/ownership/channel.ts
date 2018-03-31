import { Channel, ChannelMessage } from '../broadcast/channel';

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
    return +`${Date.now() + age}`.slice(-13);
  }
  constructor(
    private readonly channel: Channel<K>,
  ) {
    void this.channel.listen('ownership', ({ key, priority }) => {
      assert(priority > 0);
      if (this.has(key) && this.getPriority(key) < priority - Ownership.mergin) {
        void this.castPriority(key);
      }
      else {
        void this.setPriority(key, Math.min(-priority, this.getPriority(key)));
      }
    });
  }
  private readonly store: Map<K, number> = new Map();
  private getPriority(key: K): number {
    if (!this.store.has(key)) {
      void this.setPriority(key, 0); // send a reference of priority
      void this.setPriority(key, -Ownership.genPriority(Ownership.mergin));
    }
    assert(this.store.has(key));
    return this.store.get(key)!;
  }
  private setPriority(key: K, priority: number): void {
    assert(Math.abs(priority) < 1e15);
    if (this.store.has(key) && priority === this.getPriority(key)) return;
    void this.store.set(key, priority + Math.floor(Math.random() * 5 * 1e3));
    void this.castPriority(key);
  }
  private castPriority(key: K): void {
    if (!this.isTakable(key)) return;
    void this.channel.post(new OwnershipMessage(key, this.getPriority(key) + Ownership.mergin));
  }
  private has(key: K): boolean {
    return this.getPriority(key) >= Ownership.genPriority(0);
  }
  private isTakable(key: K): boolean {
    return this.getPriority(key) > 0
        || Ownership.genPriority(0) > Math.abs(this.getPriority(key));
  }
  public take(key: K, age: number): boolean {
    assert(0 <= age && age < 60 * 1000);
    age = Math.min(Math.max(age, 1 * 1000), 60 * 1000) + 100;
    if (!this.isTakable(key)) return false;
    void this.setPriority(key, Math.max(Ownership.genPriority(age), this.getPriority(key)));
    return true;
  }
  public close(): void {
    void this.channel.close();
  }
}
