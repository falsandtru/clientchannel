import { localStorage, storageEventStream } from '../../infrastructure/webstorage/api';
import { fakeStorage } from '../webstorage/model/storage';

declare global {
  interface ChannelMessageTypeMap<K extends string> {
  }
}

const version = 1;

export class ChannelMessage<K extends string> {
  constructor(
    public readonly key: K,
    public readonly type: keyof ChannelMessageTypeMap<K>,
  ) {
  }
  public readonly version = version;
}

function parse<K extends string>(msg: ChannelMessage<K>): ChannelMessage<K> | void {
  if (msg.version !== version) return;
  return msg;
}

const cache = new Set<string>();

abstract class AbstractChannel<K extends string> {
  constructor(
    public readonly name: string,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Broadcast channel "${name}" is already open.`);
    void cache.add(this.name);
  }
  public abstract listen<C extends keyof ChannelMessageTypeMap<K>>(type: C, listener: (msg: ChannelMessageTypeMap<K>[C]) => void): () => void;
  public abstract post(msg: ChannelMessage<K>): void;
  public close(): void {
    void cache.delete(this.name);
  }
}

export class Channel<K extends string> implements AbstractChannel<K> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
    return typeof BroadcastChannel === 'function'
      ? new Broadcast<K>(name, debug)
      : new Storage<K>(name, debug);
  }
  public listen<C extends keyof ChannelMessageTypeMap<K>>(type: C, listener: (msg: ChannelMessageTypeMap<K>[C]) => void): () => void {
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

class Broadcast<K extends string> extends AbstractChannel<K> implements Channel<K> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
    super(name);
  }
  private readonly channel = new BroadcastChannel(this.name);
  private readonly listeners = new Set<(ev: MessageEvent) => void>();
  public listen<C extends keyof ChannelMessageTypeMap<K>>(type: C, listener: (msg: ChannelMessageTypeMap<K>[C]) => void): () => void {
    void this.listeners.add(handler);
    void this.channel.addEventListener('message', handler);
    const { debug } = this;
    return () => (
      void this.listeners.delete(handler),
      void this.channel.removeEventListener('message', handler));

    function handler(ev: MessageEvent): void {
      const msg = parse<K>(ev.data);
      if (!msg || msg.type !== type) return;
      debug && console.log('recv', msg);
      return void listener(msg as ChannelMessageTypeMap<K>[C]);
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
    super.close();
    for (const listener of this.listeners) {
      void this.channel.removeEventListener('message', listener);
    }
    void this.listeners.clear();
  }
}

class Storage<K extends string> extends AbstractChannel<K> implements Channel<K> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
    super(name);
    void self.addEventListener('unload', () =>
      void this.storage.removeItem(this.name)
    , true);
  }
  private readonly storage = localStorage || fakeStorage;
  private readonly listeners = new Set<(ev: StorageEvent) => void>();
  public listen<C extends keyof ChannelMessageTypeMap<K>>(type: C, listener: (msg: ChannelMessageTypeMap<K>[C]) => void): () => void {
    void this.listeners.add(handler);
    void storageEventStream.on(['local', this.name], handler);
    return () => (
      void this.listeners.delete(handler),
      void storageEventStream.off(['local', this.name], handler));

    function handler(ev: StorageEvent): void {
      if (typeof ev.newValue !== 'string') return;
      const msg = parse<K>(JSON.parse(ev.newValue));
      if (!msg || msg.type !== type) return;
      return void listener(msg as ChannelMessageTypeMap<K>[C]);
    }
  }
  public post(msg: ChannelMessage<K>): void {
    if (!this.alive) return;
    void this.storage.setItem(this.name, JSON.stringify(msg));
  }
  private alive = true;
  public close(): void {
    this.alive = false;
    super.close();
    for (const listener of this.listeners) {
      void storageEventStream.off(['local', this.name], listener);
    }
    void this.listeners.clear();
    void this.storage.removeItem(this.name);
  }
}
