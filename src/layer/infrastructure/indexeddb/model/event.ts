export enum IDBEvenType {
  connect,
  disconnect,
  block,
  error,
  abort,
  crash,
  destroy
}
export namespace IDBEventName {
  export const connect = IDBEvenType[IDBEvenType.connect];
  export const disconnect = IDBEvenType[IDBEvenType.disconnect];
  export const block = IDBEvenType[IDBEvenType.block];
  export const error = IDBEvenType[IDBEvenType.error];
  export const abort = IDBEvenType[IDBEvenType.abort];
  export const crash = IDBEvenType[IDBEvenType.crash];
  export const destroy = IDBEvenType[IDBEvenType.destroy];
}

export class IDBEvent {
  constructor(
    type: IDBEvenType,
    public name: string
  ) {
    this.type = IDBEvenType[type];
    void Object.freeze(this);
  }
  public type: string;
  public namespace = [this.name];
}
