import { Math, Date, Promise, setTimeout } from 'spica/global';
import { Channel, ChannelMessage } from '../broadcast/channel';
import { Cancellation } from 'spica/cancellation';

declare global {
  interface ChannelMessageTypeMap<K extends string> {
    ownership: OwnershipMessage<K>;
  }
}

class OwnershipMessage<K extends string> extends ChannelMessage<K> {
  constructor(
    public override readonly key: K,
    public readonly priority: number,
  ) {
    super(key, 'ownership');
  }
}

export class Ownership<K extends string> {
  private static readonly mergin = 5 * 1000;
  private static genPriority(age: number): number {
    assert(age >= 0);
    return Date.now() + age;
  }
  constructor(
    private readonly channel: Channel<K>,
  ) {
    void this.cancellation.register((() => {
      const listener = () => this.close();
      void self.addEventListener('unload', listener);
      return () => void self.removeEventListener('unload', listener);
    })());
    void this.cancellation.register(() => {
      for (const key of this.store.keys()) {
        void this.release(key);
      }
      void this.channel.close();
    });
    void this.channel.listen('ownership', ({ key, priority: newPriority }) => {
      const oldPriority = this.getPriority(key);
      switch (true) {
        case newPriority < 0:
          // Release the foreign ownership.
          return newPriority === oldPriority
            ? void this.store.delete(key)
            : void 0;
        case oldPriority === 0:
          assert(newPriority >= 0);
          // Accept the foreign ownership.
          return void this.setPriority(key, -newPriority);
        case oldPriority > 0:
          assert(newPriority >= 0);
          // First commit wins.
          return oldPriority < newPriority
              && this.has(key)
            // Notify my active ownership.
            ? void this.castPriority(key)
            // Accept the foreign ownership.
            : void this.setPriority(key, -newPriority);
        case oldPriority < 0:
          assert(newPriority >= 0);
          // Update the foreign ownership.
          // Last commit wins.
          return void this.setPriority(key, -newPriority);
        default:
          assert(false);
      }
    });
  }
  private readonly store = new Map<K, number>();
  private readonly cancellation = new Cancellation();
  private alive = true;
  private getPriority(key: K): number {
    return this.store.get(key) || 0;
  }
  private setPriority(key: K, newPriority: number): void {
    const oldPriority = this.getPriority(key);
    // Don't cast the same priority repeatedly.
    if (newPriority === oldPriority) return;
    void this.store.set(key, newPriority);
    assert(this.getPriority(key) === newPriority);
    const mergin = 1000;
    assert(mergin < Ownership.mergin / 2);
    if (newPriority > 0 && newPriority > oldPriority + mergin) {
      void this.castPriority(key);
    }
  }
  private castPriority(key: K): void {
    assert(this.store.has(key));
    void this.channel.post(new OwnershipMessage(key, this.getPriority(key)));
  }
  private has(key: K): boolean {
    const priority = this.getPriority(key);
    return priority > 0
        && priority >= Ownership.genPriority(0) + Ownership.mergin;
  }
  private isTakable(key: K): boolean {
    const priority = this.getPriority(key);
    return priority >= 0
        || Ownership.genPriority(0) > Math.abs(priority);
  }
  public take(key: K, age: number): boolean
  public take(key: K, age: number, wait: number): Promise<boolean>
  public take(key: K, age: number, wait?: number): boolean | Promise<boolean> {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.isTakable(key)) return wait === void 0 ? false : Promise.resolve(false);
    assert(0 <= age && age < 60 * 1000);
    age = Math.min(Math.max(age, 1 * 1000), 60 * 1000);
    wait = wait === void 0 ? wait : Math.max(wait, 0);
    const priority = Ownership.genPriority(age) + Ownership.mergin;
    if (priority <= this.getPriority(key)) return this.has(key);
    void this.setPriority(key, priority);
    assert(this.getPriority(key) > 0);
    return wait === void 0
      ? this.has(key)
      : new Promise(resolve => void setTimeout(() => void resolve(this.extend(key, age)), wait));
  }
  public extend(key: K, age: number): boolean {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    return this.has(key)
      ? this.take(key, age)
      : false;
  }
  public release(key: K): void {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.has(key)) return;
    void this.setPriority(key, -Math.abs(this.getPriority(key)));
    void this.castPriority(key);
    void this.store.delete(key);
  }
  public close(): void {
    void this.cancellation.cancel();
    this.alive = false;
  }
}
