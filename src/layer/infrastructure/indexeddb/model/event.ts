import { Observation, Observer } from 'spica/observation';

export const idbEventStream_ = new Observation<[string] | [string, IDBEventType], IDBEvent, void>({ limit: Infinity });
export const idbEventStream: Observer<[string] | [string, IDBEventType], IDBEvent, void> = idbEventStream_;

export const enum IDBEventType {
  connect = 'connect',
  disconnect = 'disconnect',
  block = 'block',
  error = 'error',
  abort = 'abort',
  crash = 'crash',
  destroy = 'destroy',
}

export class IDBEvent {
  constructor(
    protected readonly name: string,
    public readonly type: IDBEventType,
  ) {
    void Object.freeze(this);
  }
}
