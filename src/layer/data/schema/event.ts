import {clone} from 'arch-stream';
import {IdNumber, KeyString} from '../constraint/types';

export const EventType = {
  put: <'put'>'put',
  delete: <'delete'>'delete',
  snapshot: <'snapshot'>'snapshot'
};
export type EventType
  = typeof EventType.put
  | typeof EventType.delete
  | typeof EventType.snapshot;

export class EventValue {
}

export abstract class EventRecord<T extends EventValue> {
  constructor(
    id: IdNumber,
    key: KeyString,
    value: T,
    date: number,
    type: EventType
  ) {
    if (typeof this.id === 'number' && this.id > 0 === false || this.id !== void 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event id: ${this.id}`);
    this.type = type;
    if (typeof this.type !== 'string') throw new TypeError(`LocalSocket: EventRecord: Invalid event type: ${this.type}`);
    this.key = key;
    if (typeof this.key !== 'string') throw new TypeError(`LocalSocket: EventRecord: Invalid event key: ${this.key}`);
    this.value = value;
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`LocalSocket: EventRecord: Invalid event value: ${this.value}`);
    this.date = date;
    if (typeof this.date !== 'number' || this.date >= 0 === false) throw new TypeError(`LocalSocket: EventRecord: Invalid event date: ${this.date}`);
    // put -> string, delete or snapshot -> empty string
    this.attr = this.type === EventType.put
      ? Object.keys(value).reduce((r, p) => p.length > 0 && p[0] !== '_' && p[p.length - 1] !== '_' ? p : r, '')
      : '';
    if (typeof this.attr !== 'string') throw new TypeError(`LocalSocket: EventRecord: Invalid event attr: ${this.key}`);
    if (this.type === EventType.put && this.attr.length === 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
    if (this.type !== EventType.put && this.attr.length !== 0) throw new TypeError(`LocalSocket: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);

    switch (type) {
      case EventType.put: {
        this.value = value = <T>clone(new EventValue(), <EventValue>{ [this.attr]: value[this.attr] });
        void Object.freeze(this.value);
        return;
      }
      case EventType.snapshot: {
        this.value = value = <T>clone(new EventValue(), value);
        void Object.freeze(this.value);
        return;
      }
      case EventType.delete:
      default: {
        this.value = value = <T>new EventValue();
        void Object.freeze(this.value);
        return;
      }
    }
    throw new TypeError(`LocalSocket: Invalid event type: ${type}`);
  }
  public id: IdNumber;
  public type: 'put' | 'snapshot' | 'delete';
  public key: KeyString;
  public attr: string;
  public value: T;
  public date: number;
}
