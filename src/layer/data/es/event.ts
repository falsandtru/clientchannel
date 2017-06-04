import { StoreChannelEventType } from '../../../../';
import { clone } from 'spica';
import { EventId, makeEventId } from './identifier';
import { isStorable } from '../constraint/value';

export namespace EventRecordFields {
  export const id: 'id' = 'id';
  export const key: 'key' = 'key';
  export const type: 'type' = 'type';
  export const attr: 'attr' = 'attr';
  export const value: 'value' = 'value';
  export const date: 'date' = 'date';
  export const surrogateKeyDateField: 'key+date' = 'key+date';
}

abstract class EventRecord<K extends string, V extends EventRecordValue> {
  constructor(
    public readonly id: EventId,
    public readonly type: EventRecordType,
    public readonly key: K,
    public readonly value: Partial<V>,
    public readonly date: number,
  ) {
    if (typeof this.id !== 'number' || !isFinite(this.id) || this.id >= 0 === false || !Number.isInteger(this.id)) throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${this.id}`);
    if (typeof this.type !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${this.type}`);
    if (typeof this.key !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${this.key}`);
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${this.value}`);
    if (typeof this.date !== 'number' || !isFinite(this.date) || this.date >= 0 === false) throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${this.date}`);
    // put -> string, delete or snapshot -> empty string
    this.attr = this.type === EventRecordType.put
      ? <keyof V>Object.keys(value).filter(isValidPropertyName)[0]
      : '';
    if (typeof this.attr !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event attr: ${this.key}`);
    if (this.type === EventRecordType.put && this.attr.length === 0) throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
    if (this.type !== EventRecordType.put && this.attr.length !== 0) throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);

    switch (type) {
      case EventRecordType.put:
        assert(this.attr !== '' && isValidPropertyName(this.attr));
        this.value = value = new EventRecordValue({ [this.attr]: value[this.attr] });
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      case EventRecordType.snapshot:
        assert(this.attr === '');
        this.value = value = new EventRecordValue(value);
        assert(Object.keys(this.value).every(isValidPropertyName));
        assert(Object.keys(this.value).every(isValidPropertyValue(this.value)));
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      case EventRecordType.delete:
        assert(this.attr === '');
        this.value = value = new EventRecordValue();
        assert.deepStrictEqual(Object.keys(this.value), []);
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      default:
        throw new TypeError(`ClientChannel: Invalid event type: ${type}`);
    }
  }
  public readonly attr: keyof V | '';
}
export class UnsavedEventRecord<K extends string, V extends EventRecordValue> extends EventRecord<K, V> {
  private EVENT_RECORD: V;
  constructor(
    key: K,
    value: Partial<V>,
    type: EventRecordType = EventRecordType.put,
    date: number = Date.now()
  ) {
    super(makeEventId(0), type, key, value, date);
    this.EVENT_RECORD;
    // must not have id property
    if (this.id !== 0) throw new TypeError(`ClientChannel: UnsavedEventRecord: Invalid event id: ${this.id}`);
  }
}
export class SavedEventRecord<K extends string, V extends EventRecordValue> extends EventRecord<K, V> {
  private EVENT_RECORD: V;
  constructor(
    id: EventId,
    key: K,
    value: Partial<V>,
    type: EventRecordType,
    date: number
  ) {
    super(id, type, key, value, date);
    this.EVENT_RECORD;
    if (this.id > 0 === false) throw new TypeError(`ClientChannel: SavedEventRecord: Invalid event id: ${this.id}`);
  }
}

export const EventRecordType = {
  put: <EventRecordType.Put>'put',
  delete: <EventRecordType.Delete>'delete',
  snapshot: <EventRecordType.Snapshot>'snapshot'
};
export type EventRecordType = StoreChannelEventType
export namespace EventRecordType {
  export type Put = StoreChannelEventType.Put;
  export type Delete = StoreChannelEventType.Delete;
  export type Snapshot = StoreChannelEventType.Snapshot;
}

export class EventRecordValue {
  constructor(...sources: object[]) {
    void clone(this, ...sources);
    assert(Object.keys(this).every(isValidPropertyName));
    assert(Object.keys(this).every(isValidPropertyValue(this)));
  }
}

const RegValidValueNameFormat = /^[a-zA-Z][0-9a-zA-Z_]*$/;
const RegInvalidValueNameFormat = /^[0-9A-Z_]+$/;

export function isValidPropertyName(prop: string): boolean {
  return prop.length > 0
      && !prop.startsWith('_')
      && !prop.endsWith('_')
      && !RegInvalidValueNameFormat.test(prop)
      && RegValidValueNameFormat.test(prop);
}

export function isValidPropertyValue(dao: object) {
  return (prop: string): boolean =>
    isStorable(dao[prop]);
}
