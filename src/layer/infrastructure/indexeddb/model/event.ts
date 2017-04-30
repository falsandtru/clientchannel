export type IDBEventType
  = typeof IDBEventType.connect
  | typeof IDBEventType.disconnect
  | typeof IDBEventType.block
  | typeof IDBEventType.error
  | typeof IDBEventType.abort
  | typeof IDBEventType.crash
  | typeof IDBEventType.destroy;
export namespace IDBEventType {
  export const connect = 'connect';
  export const disconnect = 'disconnect';
  export const block = 'block';
  export const error = 'error';
  export const abort = 'abort';
  export const crash = 'crash';
  export const destroy = 'destroy';
}

export class IDBEvent {
  constructor(
    public readonly type: IDBEventType,
    public readonly name: string
  ) {
    void Object.freeze(this);
  }
  public readonly namespace = [this.name];
}
