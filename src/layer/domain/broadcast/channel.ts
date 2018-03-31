import { localStorage, storageEventStream } from '../../infrastructure/webstorage/api';

export type ChannelMessage<K extends string> =
  | ChannelMessage.Save<K>
  | ChannelMessage.Ownership<K>;
export namespace ChannelMessage {
  export const version = 1;
  export function parse<K extends string>(msg: ChannelMessage<K>): ChannelMessage<K> | void {
    if (msg.version !== version) return;
    switch (msg.type) {
      case ChannelEventType.save:
        return new Save(msg.key);
      case ChannelEventType.ownership:
        return new Ownership(msg.key, (msg as ChannelMessage.Ownership<K>).priority);
      default:
        return;
    }
  }

  class Message<K extends string> {
    constructor(
      public readonly key: K,
      public readonly type: ChannelEventType,
    ) {
    }
    public readonly version = version;
  }
  export class Save<K extends string> extends Message<K> {
    constructor(
      public readonly key: K,
    ) {
      super(key, ChannelEventType.save);
    }
  }
  export class Ownership<K extends string> extends Message<K> {
    constructor(
      public readonly key: K,
      public readonly priority: number,
    ) {
      super(key, ChannelEventType.ownership);
    }
  }
}
interface ChannelMessageMap<K extends string> {
  save: ChannelMessage.Save<K>;
  ownership: ChannelMessage.Ownership<K>;
}

export type ChannelEventType =
  | ChannelEventType.save
  | ChannelEventType.ownership;
export namespace ChannelEventType {
  export type save = typeof save;
  export const save = 'save';
  export type ownership = typeof ownership;
  export const ownership = 'ownership';
}

class Ownership<K extends string> {
  private static readonly mergin = 5 * 1000;
  private static genPriority(age: number): number {
    return +`${Date.now() + age}`.slice(-13);
  }
  constructor(
    private readonly channel: Channel<K>,
  ) {
    void this.channel.listen(ChannelEventType.ownership, ({ key, priority }) => {
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
  private readonly timer: Map<K, number> = new Map();
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
    void this.store.set(key, priority);
    void this.castPriority(key);
  }
  private castPriority(key: K): void {
    if (this.timer.get(key)! > 0) return;
    if (!this.isTakable(key)) return;
    void this.channel.post(new ChannelMessage.Ownership(key, this.getPriority(key) + Ownership.mergin));
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
}

export class Channel<K extends string> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
    return typeof BroadcastChannel === 'function'
      ? new Broadcast<K>(name, debug)
      : new Storage<K>(name, debug);
  }
  public readonly ownership: Ownership<string> = new Ownership(this);
  public listen<C extends keyof ChannelMessageMap<K>>(type: C, listener: (msg: ChannelMessageMap<K>[C]) => void): () => void {
    type;
    listener;
    return () => void 0;
  }
  public post(msg: ChannelMessage<K>): void {
    msg;
  }
  public close(): void {
  }
}

class Broadcast<K extends string> implements Channel<K> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
  }
  private readonly channel = new BroadcastChannel(this.name);
  private readonly listeners = new Set<(ev: MessageEvent) => void>();
  public readonly ownership: Ownership<K> = new Ownership(this);
  public listen<C extends keyof ChannelMessageMap<K>>(type: C, listener: (msg: ChannelMessageMap<K>[C]) => void): () => void {
    void this.listeners.add(handler);
    void this.channel.addEventListener('message', handler);
    const { debug } = this;
    return () => (
      void this.listeners.delete(handler),
      void this.channel.removeEventListener('message', handler));

    function handler(ev: MessageEvent): void {
      const msg = ChannelMessage.parse<K>(ev.data);
      if (!msg || msg.type !== type) return;
      debug && console.log('recv', msg);
      return void listener(msg);
    }
  }
  public post(msg: ChannelMessage<K>): void {
    if (!this.alive) return;
    this.debug && console.log('send', msg);
    void this.channel.postMessage(msg);
  }
  private alive = true;
  public close(): void {
    this.alive = false;
    void this.listeners
      .forEach(listener =>
        void this.channel.removeEventListener('message', listener));
    void this.listeners.clear();
  }
}

class Storage<K extends string> implements Channel<K> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
    void self.addEventListener('unload', () =>
      void this.storage.removeItem(this.name)
    , true);
  }
  private readonly storage = localStorage!;
  private readonly listeners = new Set<(ev: StorageEvent) => void>();
  public readonly ownership: Ownership<K> = new Ownership(this);
  public listen<C extends keyof ChannelMessageMap<K>>(type: C, listener: (msg: ChannelMessageMap<K>[C]) => void): () => void {
    void this.listeners.add(handler);
    void storageEventStream.on(['local', this.name], handler);
    return () => (
      void this.listeners.delete(handler),
      void storageEventStream.off(['local', this.name], handler));

    function handler(ev: StorageEvent): void {
      if (typeof ev.newValue !== 'string') return;
      const msg = ChannelMessage.parse<K>(JSON.parse(ev.newValue));
      if (!msg || msg.type !== type) return;
      return void listener(msg);
    }
  }
  public post(msg: ChannelMessage<K>): void {
    if (!this.alive) return;
    void this.storage.setItem(this.name, JSON.stringify(msg));
  }
  private alive = true;
  public close(): void {
    this.alive = false;
    void this.listeners
      .forEach(listener =>
        void storageEventStream.off(['local', this.name], listener));
    void this.listeners.clear();
    void this.storage.removeItem(this.name);
  }
}
