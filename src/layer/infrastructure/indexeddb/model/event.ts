export enum IDBEvenTypes {
  connect,
  disconnect,
  block,
  error,
  abort,
  crash,
  destroy
}
export namespace IDBEventName {
  export const connect = IDBEvenTypes[IDBEvenTypes.connect];
  export const disconnect = IDBEvenTypes[IDBEvenTypes.disconnect];
  export const block = IDBEvenTypes[IDBEvenTypes.block];
  export const error = IDBEvenTypes[IDBEvenTypes.error];
  export const abort = IDBEvenTypes[IDBEvenTypes.abort];
  export const crash = IDBEvenTypes[IDBEvenTypes.crash];
  export const destroy = IDBEvenTypes[IDBEvenTypes.destroy];
}

export class IDBEvent {
  constructor(
    type: IDBEvenTypes,
    public name: string
  ) {
    this.type = IDBEvenTypes[type];
    void Object.freeze(this);
  }
  public type: string;
  public namespace = [this.name];
}
