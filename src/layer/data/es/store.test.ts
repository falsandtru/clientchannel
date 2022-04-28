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

    before(done => {
      idbEventStream
        .once(['test', IDBEventType.destroy], () =>
          idbEventStream
            .once(['test', IDBEventType.disconnect], () =>
              done()));
      destroy('test');
    });

    afterEach(done => {
      idbEventStream
        .once(['test', IDBEventType.destroy], () =>
          idbEventStream
            .once(['test', IDBEventType.disconnect], () =>
              done()));
      destroy('test');
    });

    describe('EventRecord', () => {
      it('put', () => {
        const e = '{"id":0,"type":"put","key":"","value":{"value":0},"attr":"value"}';
        const a = stringify(new UnstoredEventRecord('', new Value(0)));
        assert(a === e);
      });

      it('snapshot', () => {
        const e = '{"id":0,"type":"snapshot","key":"","value":{"value":0},"attr":""}';
        const a = stringify(new UnstoredEventRecord('', new Value(0), EventStore.EventType.snapshot));
        assert(a === e);
      });

      it('delete', () => {
        const e = '{"id":0,"type":"delete","key":"","value":{},"attr":""}';
        const a = stringify(new UnstoredEventRecord('', new Value(0), EventStore.EventType.delete));
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
          const e = '{"id":0,"type":"delete","key":"","value":{},"attr":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('', new EventStore.Value(), EventStore.EventType.delete));
          assert(a === e);
          a = stringify(compose('', []));
          assert(a === e);
        });

        it('put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot));
          assert(a === e);
          a = stringify(compose('a', [new UnstoredEventRecord('a', new Value(0))]));
          assert(a === e);
        });

        it('snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot));
          assert(a === e);
          a = stringify(compose('a', [new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot)]));
          assert(a === e);
        });

        it('delete', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          let a = '';
          a = stringify(new UnstoredEventRecord('a', new EventStore.Value(), EventStore.EventType.delete));
          assert(a === e);
          a = stringify(compose('a', [new UnstoredEventRecord('a', new EventStore.Value(), EventStore.EventType.delete)]));
          assert(a === e);
        });

      });

      describe('put', () => {
        it('override', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0)),
            new UnstoredEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0)),
            new UnstoredEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot),
            new UnstoredEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot),
            new UnstoredEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.delete),
            new UnstoredEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.delete),
            new UnstoredEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

      });

      describe('snapshot', () => {
        it('override', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.snapshot)
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.snapshot)
          ]));
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.put),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.snapshot)
          ]));
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.put),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.snapshot)
          ]));
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.delete),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.snapshot)
          ]));
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.delete),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.snapshot)
          ]));
          assert(a === e);
        });

      });

      describe('delete', () => {
        it('override', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.delete),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.delete)
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.delete),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.delete)
          ]));
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.put),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.delete)
          ]));
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.put),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.delete)
          ]));
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot),
            new UnstoredEventRecord('a', new Value(1), EventStore.EventType.delete)
          ]));
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnstoredEventRecord('a', new Value(0), EventStore.EventType.snapshot),
            new UnstoredEventRecord('a', new Value(''), EventStore.EventType.delete)
          ]));
          assert(a === e);
        });

      });

    });

    it('CRUD', done => {
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
      es.events.save
        .once(['a', 'value', 'put'], () => {
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
          es.events.save
            .once(['a', '', 'delete'], () => {
              assert(es.has('a') === false);
              assert(es.meta('a').id === 2);
              assert(es.meta('a').key === 'a');
              assert(es.meta('a').date > 0);
              assert(es.get('a').value === undefined);
              done();
            });
        });
    });

    it('clean', done => {
      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      es.add(new UnstoredEventRecord('a', new Value(0)));
      es.add(new UnstoredEventRecord('b', new Value(0)));
      es.events.save
        .once(['a', 'value', 'put'], () => {
          es.delete('a');
          es.events.save
            .once(['a', '', 'delete'], () => {
              assert(es.has('a') === false);
              assert(es.meta('a').id === 3);
              assert(es.get('a').value === undefined);
              assert(es.has('b') === true);
              assert(es.meta('b').id === 2);
              assert(es.get('b').value === 0);
              setTimeout(() => {
                assert(es.has('a') === false);
                assert(es.meta('a').id === 0);
                assert(es.has('b') === true);
                assert(es.meta('b').id === 2);
                done();
              }, 1000);
            });
        });
    });

    it('snapshot', done => {
      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      Promise.resolve()
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(1)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(2)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(3)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(4)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(5)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(6)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(7)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(8)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnstoredEventRecord('a', new Value(9)));
            es.events.save.once(['a', 'value', 'put'], () => resolve(undefined));
            es.events.save.once(['a', '', 'snapshot'], ev => {
              assert(ev.id === 10);
              assert(ev.key === 'a');
              assert(ev.attr === '');
              assert(ev.type === 'snapshot');
              assert(es.meta('a').id === 10);
              assert(es.get('a').value === 9);

              for (let i = 0; i < 9; ++i) {
                es.add(new UnstoredEventRecord('a', new Value(i + ev.id + 1)));
              }
              es.events.save.once(['a', 'value', 'put'], ev => {
                assert(ev.id === 11);
                assert(ev.key === 'a');
                assert(ev.attr === 'value');
                assert(ev.type === 'put');
                assert(es.meta('a').id === 11);
                assert(es.get('a').value === 19);
                done();
              });
            });
          }));
    });

    it('snapshot binary', done => {
      const es = new Store<string, Value>('test', open('test', Store.configure('test')));

      class Value extends EventStore.Value {
        constructor(
          public value: ArrayBuffer
        ) {
          super();
        }
      }

      es.add(new UnstoredEventRecord('a', new Value(new ArrayBuffer(0))));
      es.events.save.once(['a', '', 'snapshot'], ev => {
        assert(ev.key === 'a');
        assert(ev.attr === '');
        assert(ev.type === 'snapshot');
        assert(es.meta('a').id === 2);
        assert(es.get('a').value instanceof ArrayBuffer);
        done();
      });
    });

  });

});
