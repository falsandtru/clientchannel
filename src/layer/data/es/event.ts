import { StoreChannelEventType } from '../../../../';
import { clone } from 'spica/assign';
import { EventId, makeEventId } from './identifier';
import { isStorable } from '../database/value';

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

abstract class EventRecord<K extends string, V extends EventRecordValue> {
  constructor(
    public readonly id: EventId,
    public readonly type: EventRecordType,
    public readonly key: K,
    public readonly value: Partial<V>,
    public readonly date: number,
  ) {
    if (typeof this.id !== 'number' || !Number.isFinite(this.id) || this.id >= 0 === false || !Number.isInteger(this.id)) throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${this.id}`);
    if (typeof this.type !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${this.type}`);
    if (typeof this.key !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${this.key}`);
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${JSON.stringify(this.value)}`);
    if (typeof this.date !== 'number' || !Number.isFinite(this.date) || this.date >= 0 === false) throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${this.date}`);
    this.attr = this.type === EventRecordType.put
      ? Object.keys(value).filter(isValidPropertyName)[0] as keyof V
      : '';
    if (typeof this.attr !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event attr: ${this.key}`);

    switch (type) {
      case EventRecordType.put:
        if (!isValidPropertyName(this.attr)) throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
        assert(this.attr !== '');
        this.value = value = new EventRecordValue({ [this.attr]: value[this.attr as keyof V] });
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      case EventRecordType.snapshot:
        if (this.attr !== '') throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
        this.value = value = new EventRecordValue(value);
        assert(Object.keys(this.value).every(isValidPropertyName));
        assert(Object.keys(this.value).every(isValidPropertyValue(this.value)));
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      case EventRecordType.delete:
        if (this.attr !== '') throw new TypeError(`ClientChannel: EventRecord: Invalid event attr with ${this.type}: ${this.attr}`);
        this.value = value = new EventRecordValue();
        assert.deepStrictEqual(Object.keys(this.value), []);
        void Object.freeze(this.value);
        void Object.freeze(this);
        return;
      default:
        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${type}`);
    }
  }
  public readonly attr: keyof V | '';
}
export class UnstoredEventRecord<K extends string, V extends EventRecordValue> extends EventRecord<K, V> {
  private EVENT_RECORD: this;
  constructor(
    key: K,
    value: Partial<V>,
    type: EventRecordType = EventRecordType.put,
    date: number = Date.now()
  ) {
    super(makeEventId(0), type, key, value, date);
    this.EVENT_RECORD;
    // must not have id property
    if (this.id !== 0) throw new TypeError(`ClientChannel: UnstoredEventRecord: Invalid event id: ${this.id}`);
  }
}
export abstract class StoredEventRecord<K extends string, V extends EventRecordValue> extends EventRecord<K, V> {
  protected EVENT_RECORD: this;
  constructor(
    id: EventId,
    key: K,
    value: Partial<V>,
    type: EventRecordType,
    date: number
  ) {
    super(id, type, key, value, date);
    if (this.id > 0 === false) throw new TypeError(`ClientChannel: StoredEventRecord: Invalid event id: ${this.id}`);
  }
}
export class LoadedEventRecord<K extends string, V extends EventRecordValue> extends StoredEventRecord<K, V> {
  protected EVENT_RECORD: this;
  constructor(
    {
      id,
      key,
      value,
      type,
      date,
    }: LoadedEventRecord<K, V>
  ) {
    super(id, key, value, type, date);
    this.EVENT_RECORD;
  }
}
export class SavedEventRecord<K extends string, V extends EventRecordValue> extends StoredEventRecord<K, V> {
  protected EVENT_RECORD: this;
  constructor(
    id: EventId,
    key: K,
    value: Partial<V>,
    type: EventRecordType,
    date: number
  ) {
    super(id, key, value, type, date);
    this.EVENT_RECORD;
  }
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
