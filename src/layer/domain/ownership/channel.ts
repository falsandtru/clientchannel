import { Date, Promise, setTimeout } from 'spica/global';
import { abs, floor, max, min, random } from 'spica/alias';
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
    public readonly age: number,
  ) {
    super(key, 'ownership');
  }
}

export class Ownership<K extends string> {
  private static readonly margin = 6 * 1000;
  private static genPriority(): number {
    return Date.now();
  }
  constructor(
    private readonly channel: Channel<K>,
  ) {
    this.cancellation.register((() => {
      const listener = () => this.close();
      self.addEventListener('unload', listener);
      return () => void self.removeEventListener('unload', listener);
    })());
    this.cancellation.register(() => {
      for (const key of this.store.keys()) {
        this.release(key);
      }
      this.channel.close();
    });
    this.channel.listen('ownership', ({ key, priority: newPriority, age }) => {
      const { priority: oldPriority } = this.getOwnership(key);
      switch (true) {
        case newPriority < 0:
          // Release the foreign ownership.
          return newPriority === oldPriority
            ? void this.store.delete(key)
            : void 0;
        case oldPriority === 0:
          assert(newPriority >= 0);
          // Accept the foreign ownership.
          return void this.setOwnership(key, -newPriority, age);
        case oldPriority > 0:
          assert(newPriority >= 0);
          // First commit wins.
          return oldPriority < newPriority
              && this.has(key)
            // Notify my active ownership.
            ? void this.castOwnership(key)
            // Accept the foreign ownership.
            : void this.setOwnership(key, -newPriority, age);
        case oldPriority < 0:
          assert(newPriority >= 0);
          // Update the foreign ownership.
          // Last statement wins.
          return void this.setOwnership(key, -newPriority, age);
        default:
          assert(false);
      }
    });
  }
  private readonly store = new Map<K, { readonly priority: number; readonly age: number; }>();
  private readonly cancellation = new Cancellation();
  private alive = true;
  private getOwnership(key: K): { readonly priority: number; readonly age: number; } {
    return this.store.get(key) ?? { priority: 0, age: 0 };
  }
  private setOwnership(key: K, newPriority: number, newAge: number): void {
    const { priority: oldPriority } = this.getOwnership(key);
    // Don't cast the same priority repeatedly.
    if (newPriority === oldPriority) return;
    this.store.set(key, {
      priority: newPriority,
      age: newAge,
    });
    const throttle = Ownership.margin - 1000;
    assert(throttle >= 1000);
    if (newPriority > 0 && newPriority > oldPriority + throttle) {
      this.castOwnership(key);
    }
  }
  private castOwnership(key: K): void {
    assert(this.store.has(key));
    const { priority, age } = this.getOwnership(key);
    this.channel.post(new OwnershipMessage(key, priority, age));
  }
  private has(key: K): boolean {
    const { priority, age } = this.getOwnership(key);
    return priority > 0
        && priority + age > Ownership.genPriority();
  }
  private isTakable(key: K): boolean {
    const { priority, age } = this.getOwnership(key);
    return priority >= 0
        || Ownership.genPriority() > abs(priority) + age;
  }
  public take(key: K, age: number): boolean
  public take(key: K, age: number, wait: number): Promise<boolean>
  public take(key: K, age: number, wait?: number): boolean | Promise<boolean> {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.isTakable(key)) return wait === void 0 ? false : Promise.resolve(false);
    assert(0 <= age && age < 60 * 1000);
    age = floor(min(max(age, 1 * 1000), 60 * 1000));
    wait = wait === void 0 ? wait : min(wait, 0);
    const priority = Ownership.genPriority() + Ownership.margin + (random() * 1000 | 0);
    this.setOwnership(key, priority, age);
    assert(this.getOwnership(key).priority > 0);
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
    this.setOwnership(key, -abs(this.getOwnership(key).priority), 0);
    this.castOwnership(key);
    this.store.delete(key);
  }
  public close(): void {
    this.cancellation.cancel();
    this.alive = false;
  }
}
