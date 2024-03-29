import { Observation, Observer } from 'spica/observer';

export const idbEventStream$ = new Observation<[string, IDBEventType], IDBEvent, void>({ limit: Infinity });
export const idbEventStream: Observer<[string, IDBEventType], IDBEvent, void> = idbEventStream$;

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
    assert(Object.freeze(this));
  }
}
