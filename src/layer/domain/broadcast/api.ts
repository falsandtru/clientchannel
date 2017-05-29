import { localStorage, eventstream } from '../../infrastructure/webstorage/api';

class Channel<M extends string> {
  constructor(
    public name: string
  ) {
    return typeof BroadcastChannel === 'function'
      ? new Broadcast(name)
      : new Storage(name);
  }
  public listen(_listener: (ev: MessageEvent | StorageEvent) => void): () => void {
    return () => void 0;
  }
  public post(_message: M): void {
  }
  public close(): void {
  }
}
export { Channel as BroadcastChannel };

class Broadcast<M extends string> implements Channel<M> {
  constructor(
    public name: string
  ) {
  }
  private channel = new BroadcastChannel(this.name);
  private listeners = new Set<(_: MessageEvent) => void>();
  public listen(listener: (ev: MessageEvent) => void): () => void {
    void this.listeners.add(listener);
    void this.channel.addEventListener('message', listener);
    return () => (
      void this.listeners.delete(listener),
      void this.channel.removeEventListener('message', listener));
  }
  public post(message: M): void {
    void this.channel.postMessage(message);
  }
  public close(): void {
    void this.listeners
      .forEach(listener =>
        void this.channel.removeEventListener('message', listener));
  }
}

class Storage<M extends string> implements Channel<M> {
  constructor(
    public name: string
  ) {
    void self.addEventListener('unload', () =>
      void this.storage.removeItem(this.name)
    , true);
  }
  private storage = localStorage!;
  private listeners = new Set<(_: StorageEvent) => void>();
  public listen(listener_: (ev: StorageEvent) => void): () => void {
    const listener: typeof listener_ = ev =>
      typeof ev.newValue === 'string' &&
      void listener_(ev);
    void this.listeners.add(listener);
    void eventstream.on(['local', this.name], listener);
    return () => (
      void this.listeners.delete(listener),
      void eventstream.off(['local', this.name], listener));
  }
  public post(message: M): void {
    void this.storage.removeItem(this.name);
    void this.storage.setItem(this.name, message);
  }
  public close(): void {
    void this.listeners
      .forEach(listener =>
        void eventstream.off(['local', this.name], listener));
    void this.storage.removeItem(this.name);
  }
}
