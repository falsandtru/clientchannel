import { Observation, Observer } from 'spica/observation';

export const idbEventStream_ = new Observation<[string] | [string, IDBEventType], IDBEvent, void>();
export const idbEventStream: Observer<[string] | [string, IDBEventType], IDBEvent, void> = idbEventStream_;

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
    protected readonly name: string,
    public readonly type: IDBEventType,
  ) {
    void Object.freeze(this);
  }
}
