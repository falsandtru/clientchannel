import {LocalSocketObject, LocalSocketObjectMetaData, LocalSocketEvent, LocalSocketEventType} from 'localsocket';
import {Observable, uuid} from 'spica';
import {open, destroy, event, IDBEventType, IDBTransaction, IDBCursorDirection, IDBKeyRange} from '../../../infrastructure/indexeddb/api';
import {IdNumber, KeyString} from '../../../data/constraint/types';
import {DataStore} from './socket/data';
import {AccessStore} from './socket/access';
import {ExpiryStore} from './socket/expiry';
import {noop} from '../../../../lib/noop';

export class SocketStore<T extends SocketStore.Value> {
  constructor(
    public database: string,
    destroy: (err: DOMError, event: Event) => boolean,
    public expiry = Infinity
  ) {
    void open(database, {
      make(db) {
        return DataStore.configure().make(db)
            && AccessStore.configure().make(db)
            && ExpiryStore.configure().make(db);
      },
      verify(db) {
        return DataStore.configure().verify(db)
            && AccessStore.configure().verify(db)
            && ExpiryStore.configure().verify(db);
      },
      destroy(err, ev) {
        return DataStore.configure().destroy(err, ev)
            && AccessStore.configure().destroy(err, ev)
            && ExpiryStore.configure().destroy(err, ev)
            && destroy(err, ev);
      }
    });
    this.schema = new Schema<T>(this, this.expiries);
    void event.on([database, IDBEventType.destroy, this.uuid], () => void this.schema.bind());
  }
  private uuid = uuid();
  protected schema: Schema<T>;
  public events = {
    load: new Observable<[string] | [string, string] | [string, string, string], SocketStore.Event, void>(),
    save: new Observable<[string] | [string, string] | [string, string, string], SocketStore.Event, void>(),
    loss: new Observable<[string] | [string, string] | [string, string, string], SocketStore.Event, void>()
  };
  public sync(keys: KeyString[], cb: (errs: [KeyString, DOMError | Error][]) => any = noop, timeout?: number): void {
    return this.schema.data.sync(keys, cb, timeout);
  }
  public meta(key: string): LocalSocketObjectMetaData {
    return this.schema.data.meta(KeyString(key));
  }
  public has(key: string): boolean {
    return this.schema.data.has(KeyString(key));
  }
  public get(key: string): T {
    return this.schema.data.get(KeyString(key));
  }
  public add(record: DataStore.Record<T>): void {
    return this.schema.data.add(record);
  }
  public delete(key: string): void {
    return this.schema.data.delete(KeyString(key));
  }
  private expiries = new Map<string, number>();
  public expire(key: string, expiry: number = this.expiry): void {
    assert(expiry > 0);
    if (expiry === Infinity) return;
    return void this.expiries.set(key, expiry);
  }
  public recent(limit: number, cb: (keys: string[], error: DOMError) => any): void {
    const keys: string[] = [];
    return void this.schema.access.cursor(
      null,
      AccessStore.fields.date,
      IDBCursorDirection.prevunique,
      IDBTransaction.readonly,
      (cursor, err) => {
        if (!cursor) return void cb(keys, err);
        if (--limit < 0) return;
        void keys.push(cursor.primaryKey);
        void cursor.continue();
      }
    );
  }
  public destroy(): void {
    void event.off([this.database, IDBEventType.destroy, this.uuid]);
    return destroy(this.database);
  }
}
export namespace SocketStore {
  export type EventType = LocalSocketEventType;
  export const EventType = DataStore.EventType;
  export class Event extends DataStore.Event implements LocalSocketEvent { }
  export class Record<T> extends DataStore.Record<T> { }
  export interface Value extends LocalSocketObject { }
  export class Value extends DataStore.Value implements LocalSocketObject {
  }
}

class Schema<T extends SocketStore.Value> {
  constructor(
    private store_: SocketStore<T>,
    private expiries_: Map<string, number>
  ) {
    void this.bind();
  }
  public bind(): void {
    const keys = this.data ? this.data.keys() : [];
    this.data = new DataStore<KeyString, T>(this.store_.database);
    this.data.events.load.monitor(<any>[], ev => this.store_.events.load.emit([ev.key, ev.attr, ev.type], ev));
    this.data.events.save.monitor(<any>[], ev => this.store_.events.save.emit([ev.key, ev.attr, ev.type], ev));
    this.data.events.loss.monitor(<any>[], ev => this.store_.events.loss.emit([ev.key, ev.attr, ev.type], ev));
    this.access = new AccessStore(this.store_.database, this.data.events_.access);
    this.expire = new ExpiryStore(this.store_.database, this.store_, this.data, this.expiries_);

    void this.data.sync(keys);
  }
  public data: DataStore<KeyString, T>;
  public access: AccessStore;
  public expire: ExpiryStore;
}
