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

function parse<K extends string>(msg: ChannelMessage<K>): ChannelMessage<K> | undefined {
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
    cache.add(this.name);
  }
  private readonly channel = new BroadcastChannel(`clientchannel::${this.name}`);
  private readonly listeners = new Set<(ev: MessageEvent<ChannelMessage<K>>) => void>();
  private ensureAliveness(): void {
    if (!this.alive) throw new Error(`ClientChannel: Broadcast channel "${this.name}" is already closed.`);
  }
  public listen<C extends keyof ChannelMessageTypeMap<K>>(type: C, listener: (msg: ChannelMessageTypeMap<K>[C]) => void): () => void {
    this.ensureAliveness();
    this.listeners.add(handler);
    this.channel.addEventListener('message', handler);
    const { debug } = this;
    return () => {
      this.listeners.delete(handler);
      this.channel.removeEventListener('message', handler);
    };

    function handler(ev: MessageEvent<ChannelMessage<K>>): void {
      const msg = parse<K>(ev.data);
      if (!msg || msg.type !== type) return;
      debug && console.log('recv', msg);
      listener(msg as ChannelMessageTypeMap<K>[C]);
    }
  }
  public post(msg: ChannelMessage<K>): void {
    this.ensureAliveness();
    this.debug && console.log('send', msg);
    this.channel.postMessage(msg);
  }
  private alive = true;
  public close(): void {
    this.channel.close();
    this.listeners.clear();
    cache.delete(this.name);
    this.alive = false;
  }
}
