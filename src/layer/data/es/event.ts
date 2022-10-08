import { StoreChannel } from '../../../..';
import { EventId, makeEventId } from './identifier';
import { Prop, isValidProperty, isValidPropertyName } from '../database/value';
import { clone } from 'spica/assign';

export type EventRecordType = StoreChannel.EventType
export const EventRecordType = {
  Put: 'put',
  Delete: 'delete',
  Snapshot: 'snapshot',
} as const;
export namespace EventRecordType {
}

abstract class EventRecord<K extends string, V extends EventRecordValue> {
  constructor(
    public readonly id: EventId,
    public readonly type: EventRecordType,
    public readonly key: K,
    public readonly value: Partial<V>,
    public readonly date: number,
  ) {
    if (typeof this.id !== 'number' || this.id >= 0 === false || !Number.isSafeInteger(this.id)) throw new TypeError(`ClientChannel: EventRecord: Invalid event id: ${this.id}`);
    if (typeof this.type !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${this.type}`);
    if (typeof this.key !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event key: ${this.key}`);
    if (typeof this.value !== 'object' || !this.value) throw new TypeError(`ClientChannel: EventRecord: Invalid event value: ${JSON.stringify(this.value)}`);
    if (typeof this.date !== 'number' || this.date >= 0 === false || !Number.isFinite(this.date)) throw new TypeError(`ClientChannel: EventRecord: Invalid event date: ${this.date}`);
    this.prop = this.type === EventRecordType.Put
      ? Object.keys(value).filter(isValidPropertyName)[0] as Prop<V>
      : '';
    if (typeof this.prop !== 'string') throw new TypeError(`ClientChannel: EventRecord: Invalid event prop: ${this.key}`);

    switch (type) {
      case EventRecordType.Put:
        if (!isValidPropertyName(this.prop)) throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${this.type}: ${this.prop}`);
        assert(this.prop !== '');
        this.value = value = new EventRecordValue({ [this.prop]: value[this.prop as Prop<V>] });
        assert(Object.freeze(this.value));
        assert(Object.freeze(this));
        return;
      case EventRecordType.Snapshot:
        if (this.prop !== '') throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${this.type}: ${this.prop}`);
        this.value = value = new EventRecordValue(value);
        assert(Object.entries(this.value).every(isValidProperty));
        assert(Object.freeze(this.value));
        assert(Object.freeze(this));
        return;
      case EventRecordType.Delete:
        if (this.prop !== '') throw new TypeError(`ClientChannel: EventRecord: Invalid event prop with ${this.type}: ${this.prop}`);
        this.value = value = new EventRecordValue();
        assert.deepStrictEqual(Object.keys(this.value), []);
        assert(Object.freeze(this.value));
        assert(Object.freeze(this));
        return;
      default:
        throw new TypeError(`ClientChannel: EventRecord: Invalid event type: ${type}`);
    }
  }
  public readonly prop: Prop<V> | '';
}
export class UnstoredEventRecord<K extends string, V extends EventRecordValue> extends EventRecord<K, V> {
  private readonly EVENT_RECORD!: this;
  constructor(
    key: K,
    value: Partial<V>,
    type: EventRecordType = EventRecordType.Put,
    date: number = Date.now()
  ) {
    super(makeEventId(0), type, key, value, date);
    this.EVENT_RECORD;
    // Must not have id property.
    if (this.id !== 0) throw new TypeError(`ClientChannel: UnstoredEventRecord: Invalid event id: ${this.id}`);
  }
}
export abstract class StoredEventRecord<K extends string, V extends EventRecordValue> extends EventRecord<K, V> {
  protected readonly EVENT_RECORD!: this;
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
  protected override readonly EVENT_RECORD!: this;
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
  protected override readonly EVENT_RECORD!: this;
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
    clone(this, ...sources);
    assert(Object.entries(this).every(isValidProperty));
  }
}
