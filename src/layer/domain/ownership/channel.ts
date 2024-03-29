import { abs, floor, max, min } from 'spica/alias';
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
    public readonly ttl: number,
  ) {
    super(key, 'ownership');
  }
}
interface OwnershipValue {
  readonly priority: number;
  readonly ttl: number;
}

export class Ownership<K extends string> {
  private static readonly throttle = 5 * 1000;
  private static readonly margin = 1 * 1000;
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
    this.channel.listen('ownership', ({ key, priority: newPriority, ttl: newTTL }) => {
      const { priority: oldPriority } = this.getOwnership(key);
      switch (true) {
        case newPriority < 0:
          // Release the foreign ownership.
          return newPriority === oldPriority
            ? void this.store.delete(key)
            : undefined;
        case oldPriority === 0:
          assert(newPriority >= 0);
          // Accept the foreign ownership.
          return void this.setOwnership(key, -newPriority, newTTL);
        case oldPriority > 0:
          assert(newPriority >= 0);
          // First commit wins.
          return oldPriority < newPriority
              && this.has(key)
            // Notify my valid ownership.
            ? void this.castOwnership(key)
            // Accept the foreign ownership.
            : void this.setOwnership(key, -newPriority, newTTL);
        case oldPriority < 0:
          assert(newPriority >= 0);
          // Update the foreign ownership.
          // Last statement wins.
          return void this.setOwnership(key, -newPriority, newTTL);
        default:
          assert(false);
      }
    });
  }
  private readonly store = new Map<K, OwnershipValue>();
  private readonly cancellation = new Cancellation();
  private alive = true;
  private getOwnership(key: K): OwnershipValue {
    return this.store.get(key) ?? { priority: 0, ttl: 0 };
  }
  private setOwnership(key: K, newPriority: number, newTTL: number): void {
    const { priority: oldPriority, ttl: oldTTL } = this.getOwnership(key);
    this.store.set(key, {
      priority: newPriority,
      ttl: newTTL,
    });
    if (newPriority > 0 && newPriority + newTTL - Ownership.throttle > abs(oldPriority) + oldTTL) {
      this.castOwnership(key);
    }
  }
  private castOwnership(key: K): void {
    assert(this.store.has(key));
    const { priority, ttl } = this.getOwnership(key);
    this.channel.post(new OwnershipMessage(key, priority, ttl));
  }
  private has(key: K): boolean {
    const { priority, ttl } = this.getOwnership(key);
    return priority >= 0
        && Ownership.genPriority() <= priority + ttl;
  }
  private isTakable(key: K): boolean {
    const { priority, ttl } = this.getOwnership(key);
    return priority >= 0
        || Ownership.genPriority() > abs(priority) + ttl;
  }
  public take(key: K, ttl: number): boolean
  public take(key: K, ttl: number, wait: number): Promise<boolean>
  public take(key: K, ttl: number, wait?: number): boolean | Promise<boolean> {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.isTakable(key)) return wait === undefined ? false : Promise.resolve(false);
    assert(0 <= ttl && ttl < 60 * 1000);
    ttl = floor(min(max(ttl, 1 * 1000), 60 * 1000));
    wait = wait === undefined ? wait : min(wait, 0);
    const priority = Ownership.genPriority() + Ownership.throttle + Ownership.margin;
    assert(priority > 0);
    this.setOwnership(key, priority, ttl);
    return wait === undefined
      ? this.has(key)
      : new Promise(resolve => void setTimeout(() => void resolve(this.extend(key, ttl)), wait));
  }
  public extend(key: K, ttl: number): boolean {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    return this.has(key)
      ? this.take(key, ttl)
      : false;
  }
  public release(key: K): void {
    if (!this.alive) throw new Error(`ClientChannel: Ownership channel "${this.channel.name}" is already closed.`);
    if (!this.has(key)) return;
    this.setOwnership(key, -this.getOwnership(key).priority, 0);
    this.castOwnership(key);
    this.store.delete(key);
  }
  public close(): void {
    this.cancellation.cancel();
    this.alive = false;
  }
}
