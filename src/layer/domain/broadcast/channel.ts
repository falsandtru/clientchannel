import { localStorage, storageEventStream } from '../../infrastructure/webstorage/api';

export type ChannelMessage<K extends string> =
  | ChannelMessage.Save<K>
  | ChannelMessage.Ownership<K>;
export namespace ChannelMessage {
  export const version = 1;
  export function parse<K extends string>(msg: ChannelMessage<K>): ChannelMessage<K> | void {
    if (msg.version !== version) return;
    switch (msg.type) {
      case ChannelEvent.save:
        return new Save(msg.key);
      case ChannelEvent.ownership:
        return new Ownership(msg.key, (msg as ChannelMessage.Ownership<K>).priority);
      default:
        return;
    }
  }

  class Message<K extends string> {
    constructor(
      public readonly key: K,
      public readonly type: ChannelEvent,
    ) {
    }
    public readonly version = version;
  }
  export class Save<K extends string> extends Message<K> {
    constructor(
      public readonly key: K,
    ) {
      super(key, ChannelEvent.save);
    }
  }
  export class Ownership<K extends string> extends Message<K> {
    constructor(
      public readonly key: K,
      public readonly priority: number,
    ) {
      super(key, ChannelEvent.ownership);
    }
  }
}
interface ChannelMessageMap<K extends string> {
  save: ChannelMessage.Save<K>;
  ownership: ChannelMessage.Ownership<K>;
}

export type ChannelEvent =
  | ChannelEvent.save
  | ChannelEvent.ownership;
export namespace ChannelEvent {
  export type save = typeof save;
  export const save = 'save';
  export type ownership = typeof ownership;
  export const ownership = 'ownership';
}

class Ownership<K extends string> {
  private static priority(expiry = Date.now()): number {
    return +`${expiry}`.slice(-13) + +`${(Math.random() * 1e3) | 0}`.slice(-3);
  }
  constructor(
    private readonly channel: Channel<K>,
  ) {
    void this.channel.listen(ChannelEvent.ownership, ({ key, priority }) =>
      priority > this.priority(key)
        ? void this.store.set(key, -priority)
        : void this.channel.post(new ChannelMessage.Ownership(key, this.priority(key))));
  }
  private readonly store: Map<K, number> = new Map();
  public priority(key: K): number {
    return this.store.get(key) || 0;
  }
  public take(key: K, age: number): boolean {
    assert(age < 60 * 1000);
    const priority = Ownership.priority(Date.now() + Math.min(Math.max(age, 1 * 1000), 60 * 1000));
    assert(priority > 0);
    if (priority <= Math.abs(this.priority(key))) return this.priority(key) > 0;
    void this.store.set(key, priority);
    void this.channel.post(new ChannelMessage.Ownership(key, this.priority(key)));
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
  public readonly ownership: Ownership<K>;
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
  private readonly id = `${'0'.repeat(3)}${Math.random() * 1e3 | 0}`.slice(-3);
  private readonly channel = new BroadcastChannel(this.name);
  private readonly listeners = new Set<(ev: MessageEvent) => void>();
  public readonly ownership: Ownership<K> = new Ownership(this);
  public listen<C extends keyof ChannelMessageMap<K>>(type: C, listener: (msg: ChannelMessageMap<K>[C]) => void): () => void {
    void this.listeners.add(handler);
    void this.channel.addEventListener('message', handler);
    const { debug, id } = this;
    return () => (
      void this.listeners.delete(handler),
      void this.channel.removeEventListener('message', handler));

    function handler(ev: MessageEvent): void {
      const msg = ChannelMessage.parse<K>(ev.data);
      if (!msg || msg.type !== type) return;
      debug && console.log(id, 'recv', msg);
      return void listener(msg);
    }
  }
  public post(msg: ChannelMessage<K>): void {
    if (!this.alive) return;
    this.debug && console.log(this.id, 'send', msg);
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
