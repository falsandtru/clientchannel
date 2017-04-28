import { StoreChannelEvent } from '../../../../';
import { clone } from 'spica';
import { IdNumber } from '../constraint/types';

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
    public readonly id: IdNumber,
    public readonly type: EventType,
    public readonly key: K,
    public readonly value: Partial<V>,
    public readonly date: number,
  ) {
    if (typeof this.id === 'number' && this.id >= 0 === false || !Number.isInteger(this.id)) throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${this.id}`);
    if (typeof this.type !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${this.type}`);
    if (typeof this.key !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${this.key}`);
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${this.value}`);
    if (typeof this.date !== 'number' || this.date >= 0 === false) throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${this.date}`);
    // put -> string, delete or snapshot -> empty string
    this.attr = this.type === EventType.put
      ? <keyof V>Object.keys(value).reduce((r, p) => p.length > 0 && p[0] !== '_' && p[p.length - 1] !== '_' ? p : r, '')
      : '';
    if (typeof this.attr !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event attr: ${this.key}`);
    if (this.type === EventType.put && this.attr.length === 0) throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
    if (this.type !== EventType.put && this.attr.length !== 0) throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);

    switch (type) {
      case EventType.put: {
        this.value = value = clone<EventValue>(new EventValue(), <EventValue>{ [this.attr]: value[this.attr] });
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      }
      case EventType.snapshot: {
        this.value = value = clone<EventValue>(new EventValue(), value);
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      }
      case EventType.delete: {
        this.value = value = new EventValue();
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      }
      default:
        throw new TypeError(`ClientChannel: Invalid event type: ${type}`);
    }
  }
  public readonly attr: keyof V | '';
}
export class UnsavedEventRecord<K extends string, V extends EventValue> extends EventRecord<K, V> {
  private EVENT_RECORD: V;
  constructor(
    key: K,
    value: Partial<V>,
    type: EventType = EventType.put,
    date: number = Date.now()
  ) {
    super(IdNumber(0), type, key, value, date);
    this.EVENT_RECORD;
    // must not have id property
    if (this.id !== 0) throw new TypeError(`ClientChannel: UnsavedEventRecord: Invalid event id: ${this.id}`);
  }
}
export class SavedEventRecord<K extends string, V extends EventValue> extends EventRecord<K, V> {
  private EVENT_RECORD: V;
  constructor(
    id: IdNumber,
    key: K,
    value: Partial<V>,
    type: EventType,
    date: number
  ) {
    super(id, type, key, value, date);
    this.EVENT_RECORD;
    if (this.id > 0 === false) throw new TypeError(`ClientChannel: SavedEventRecord: Invalid event id: ${this.id}`);
  }
}

export const EventType = {
  put: <EventType.Put>'put',
  delete: <EventType.Delete>'delete',
  snapshot: <EventType.Snapshot>'snapshot'
};
export type EventType = StoreChannelEvent.Type
export namespace EventType {
  export type Put = StoreChannelEvent.Type.Put;
  export type Delete = StoreChannelEvent.Type.Delete;
  export type Snapshot = StoreChannelEvent.Type.Snapshot;
}

export class EventValue {
}
