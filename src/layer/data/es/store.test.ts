import { EventStore, compose } from './store';
import { UnstoredEventRecord, StoredEventRecord } from './event';
import { open, Listen, destroy, idbEventStream, IDBEventType } from '../../infrastructure/indexeddb/api';

describe('Unit: layers/data/es/store', function () {
  this.timeout(9 * 1e3);

  describe('spec', () => {
    class Value extends EventStore.Value {
      constructor(
        public value: number
      ) {
        super();
      }
    }
    class Store<K extends string, V extends EventStore.Value> extends EventStore<K, V> {
      constructor(name: string, listen: Listen) {
        super(name, listen);
      }
    }
    function stringify<K extends string, V extends EventStore.Value>(e: UnstoredEventRecord<K, V> | StoredEventRecord<K, V>): string {
      return JSON.stringify(e)
        .replace(/"date":\s?\d+,\s?/, '');
    }

    beforeEach(done => {
      idbEventStream.once(['test', IDBEventType.destroy], () =>
        idbEventStream.once(['test', IDBEventType.disconnect], () => done()));
      destroy('test');
    });

    describe('EventRecord', () => {
      it('put', () => {
        const e = '{"id":0,"type":"put","key":"","value":{"value":0},"prop":"value"}';
        const a = stringify(new UnstoredEventRecord('', new Value(0)));
        assert(a === e);
      });

      it('snapshot', () => {
        const e = '{"id":0,"type":"snapshot","key":"","value":{"value":0},"prop":""}';
        const a = stringify(new UnstoredEventRecord('', new Value(0), EventStore.EventType.Snapshot));
        assert(a === e);
      });

      it('delete', () => {
        const e = '{"id":0,"type":"delete","key":"","value":{},"prop":""}';
        const a = stringify(new UnstoredEventRecord('', new Value(0), EventStore.EventType.Delete));
        assert(a === e);
      });

    });

    describe('compose', () => {
      class Value extends EventStore.Value {
        constructor(
          value: any
        ) {
          super();
          if (value === null) return;
          this[typeof value] = value;
        }
      }

      describe('single', () => {
        it('empty', () => {
          const e = '{"id":0,"type":"delete","key":"","value":{},"prop":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('', new EventStore.Value(), EventStore.EventType.Delete));
          assert(a === e);
          a = stringify(compose('', []));
          assert(a === e);
        });

        it('put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0},"prop":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot));
          assert(a === e);
          a = stringify(compose('a', [new UnstoredEventRecord('a', new Value(0))]));
          assert(a === e);
        });

        it('snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0},"prop":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot));
          assert(a === e);
          a = stringify(compose('a', [new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot)]));
          assert(a === e);
        });

        it('delete', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('a', new EventStore.Value(), EventStore.EventType.Delete));
          assert(a === e);
          a = stringify(compose('a', [new UnstoredEventRecord('a', new EventStore.Value(), EventStore.EventType.Delete)]));
          assert(a === e);
        });

      });

      describe('put', () => {
        it('override', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0)),
            new UnstoredEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0,"string":""},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0)),
            new UnstoredEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot),
            new UnstoredEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0,"string":""},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot),
            new UnstoredEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Delete),
            new UnstoredEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Delete),
            new UnstoredEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

      });

      describe('snapshot', () => {
        it('override', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.Snapshot)
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.Snapshot)
          ]));
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Put),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.Snapshot)
          ]));
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Put),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.Snapshot)
          ]));
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Delete),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.Snapshot)
          ]));
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Delete),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.Snapshot)
          ]));
          assert(a === e);
        });

      });

      describe('delete', () => {
        it('override', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Delete),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.Delete)
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Delete),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.Delete)
          ]));
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Put),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.Delete)
          ]));
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Put),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.Delete)
          ]));
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.Delete)
          ]));
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"prop":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.Snapshot),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.Delete)
          ]));
          assert(a === e);
        });

      });

    });

    it('CRUD', async () => {
      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      assert(es.has('a') === false);
      assert(es.meta('a').id === 0);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date === 0);
      assert(es.get('a').value === undefined);
      es.add(new UnstoredEventRecord('a', new Value(0)));
      assert(es.has('a') === true);
      assert(es.meta('a').id === 0);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date > 0);
      assert(es.get('a').value === 0);
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      assert(es.has('a') === true);
      assert(es.meta('a').id === 1);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date > 0);
      assert(es.get('a').value === 0);
      es.delete('a');
      assert(es.has('a') === false);
      assert(es.meta('a').id === 1);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date > 0);
      assert(es.get('a').value === undefined);
      await new Promise(resolve => es.events.save.once(['a', '', 'delete'], resolve));
      assert(es.has('a') === false);
      assert(es.meta('a').id === 2);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date > 0);
      assert(es.get('a').value === undefined);
    });

    it('clean', async () => {
      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      es.add(new UnstoredEventRecord('a', new Value(0)));
      es.add(new UnstoredEventRecord('b', new Value(0)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.delete('a');
      await new Promise(resolve => es.events.save.once(['a', '', 'delete'], resolve));
      assert(es.has('a') === false);
      assert(es.meta('a').id === 3);
      assert(es.get('a').value === undefined);
      assert(es.has('b') === true);
      assert(es.meta('b').id === 2);
      assert(es.get('b').value === 0);
      await new Promise(resolve => es.events.clear.once(['a'], resolve));
      assert(es.has('a') === false);
      assert(es.meta('a').id === 0);
      assert(es.has('b') === true);
      assert(es.meta('b').id === 2);
    });

    it('snapshot', async () => {
      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      es.add(new UnstoredEventRecord('a', new Value(1)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(2)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(3)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(4)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(5)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(6)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(7)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(8)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(9)));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      let ev: EventStore.Event<string, string>;
      ev = await new Promise(resolve => es.events.save.once(['a', '', 'snapshot'], resolve));
      assert(ev.id === 10);
      assert(ev.key === 'a');
      assert(ev.prop === '');
      assert(ev.type === 'snapshot');
      assert(es.meta('a').id === 10);
      assert(es.get('a').value === 9);
      for (let i = 0; i < 9; ++i) {
        es.add(new UnstoredEventRecord('a', new Value(10 + i + 1)));
      }
      ev = await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      assert(ev.id === 11);
      assert(ev.key === 'a');
      assert(ev.prop === 'value');
      assert(ev.type === 'put');
      assert(es.get('a').value === 19);
      assert(es.meta('a').id === 11);
      assert(es.get('a').value === 19);
    });

    it('snapshot binary', async () => {
      class Value extends EventStore.Value {
        constructor(
          public value: ArrayBuffer
        ) {
          super();
        }
      }

      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      es.add(new UnstoredEventRecord('a', new Value(new ArrayBuffer(0))));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(new ArrayBuffer(0))));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      es.add(new UnstoredEventRecord('a', new Value(new ArrayBuffer(0))));
      await new Promise(resolve => es.events.save.once(['a', 'value', 'put'], resolve));
      let ev: EventStore.Event<string, string>;
      ev = await new Promise(resolve => es.events.save.once(['a', '', 'snapshot'], resolve));
      assert(ev.key === 'a');
      assert(ev.prop === '');
      assert(ev.type === 'snapshot');
      assert(es.meta('a').id === 4);
      assert(es.get('a').value instanceof ArrayBuffer);
    });

  });

});
