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

export class Channel<K extends string> implements Channel<K> {
  constructor(
    public readonly name: string,
    public readonly debug: boolean,
  ) {
    if (cache.has(name)) throw new Error(`ClientChannel: Broadcast channel "${name}" is already open.`);
    void cache.add(this.name);
  }
  private readonly channel = new BroadcastChannel(this.name);
  private readonly listeners = new Set<(ev: MessageEvent) => void>();
  private ensureAliveness(): void {
    if (!this.alive) throw new Error(`ClientChannel: Broadcast channel "${this.name}" is already closed.`);
  }
  public listen<C extends keyof ChannelMessageTypeMap<K>>(type: C, listener: (msg: ChannelMessageTypeMap<K>[C]) => void): () => void {
    void this.ensureAliveness();
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
    void this.ensureAliveness();
    this.debug && console.log('send', msg);
    void this.channel.postMessage(msg);
  }
  private alive = true;
  public close(): void {
    this.alive = false;
    void cache.delete(this.name);
    for (const listener of this.listeners) {
      void this.channel.removeEventListener('message', listener);
    }
    void this.listeners.clear();
  }
}
