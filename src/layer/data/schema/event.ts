import {clone} from 'spica';
import {IdNumber} from '../constraint/types';

export namespace EventRecordFields {
  export const id: 'id' = 'id';
  export const key: 'key' = 'key';
  export const type: 'type' = 'type';
  export const attr: 'attr' = 'attr';
  export const value: 'value' = 'value';
  export const date: 'date' = 'date';
  export const surrogateKeyDateField: 'key+date' = 'key+date';
}

abstract class EventRecord<K extends string, V extends EventValue> {
  constructor(
    id: IdNumber,
    key: K,
    value: V,
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
        this.value = value = <V>clone(new EventValue(), <EventValue>{ [this.attr]: value[this.attr] });
        void Object.freeze(this.value);
        return;
      }
      case EventType.snapshot: {
        this.value = value = <V>clone(new EventValue(), value);
        void Object.freeze(this.value);
        return;
      }
      case EventType.delete: {
        this.value = value = <V>new EventValue();
        void Object.freeze(this.value);
        return;
      }
      default:
        throw new TypeError(`LocalSocket: Invalid event type: ${type}`);
    }
  }
  public id: IdNumber;
  public type: EventType;
  public key: K;
  public attr: string;
  public value: V;
  public date: number;
}
export class UnsavedEventRecord<K extends string, V extends EventValue> extends EventRecord<K, V> {
  private EVENT_RECORD: V;
  constructor(
    key: K,
    value: V,
    type: EventType = EventType.put,
    date: number = Date.now()
  ) {
    super(void 0, key, value, date, type);
    // must not have id property
    if (this.id !== void 0 || 'id' in this) throw new TypeError(`LocalSocket: UnsavedEventRecord: Invalid event id: ${this.id}`);
    //void Object.freeze(this);
  }
}
export class SavedEventRecord<K extends string, V extends EventValue> extends EventRecord<K, V> {
  private EVENT_RECORD: V;
  constructor(
    public id: IdNumber,
    key: K,
    value: V,
    type: EventType,
    date: number
  ) {
    super(id, key, value, date, type);
    if (this.id > 0 === false) throw new TypeError(`LocalSocket: SavedEventRecord: Invalid event id: ${this.id}`);
    void Object.freeze(this);
  }
}

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
