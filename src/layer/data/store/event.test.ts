import { compose, EventStore, UnsavedEventRecord, SavedEventRecord } from './event';
import { open, destroy, event, IDBEventType } from '../../infrastructure/indexeddb/api';

describe('Unit: layers/data/store/event', function () {
  this.timeout(5 * 1e3);

  describe('spec', () => {
    class Value extends EventStore.Value {
      constructor(
        public value: number
      ) {
        super();
      }
    }
    class Store<K extends string, V extends EventStore.Value> extends EventStore<K, V> {
      constructor(database: string, name: string) {
        super(database, name);
      }
    }
    function stringify<K extends string, V extends EventStore.Value>(e: UnsavedEventRecord<K, V> | SavedEventRecord<K, V>): string {
      return JSON.stringify(e)
        .replace(/"date":\s?\d+,\s?/, '');
    }

    before(done => {
      event
        .once(['test', IDBEventType.destroy], () =>
          event
            .once(['test', IDBEventType.disconnect], () => done())
        );
      destroy('test');
    });

    afterEach(done => {
      event
        .once(['test', IDBEventType.destroy], () =>
          event
            .once(['test', IDBEventType.disconnect], () => done())
        );
      destroy('test');
    });

    describe('EventRecord', () => {
      it('put', () => {
        const e = '{"id":0,"type":"put","key":"","value":{"value":0},"attr":"value"}';
        const a = stringify(new UnsavedEventRecord('', new Value(0)));
        assert(a === e);
      });

      it('snapshot', () => {
        const e = '{"id":0,"type":"snapshot","key":"","value":{"value":0},"attr":""}';
        const a = stringify(new UnsavedEventRecord('', new Value(0), EventStore.Event.Type.snapshot));
        assert(a === e);
      });

      it('delete', () => {
        const e = '{"id":0,"type":"delete","key":"","value":{},"attr":""}';
        const a = stringify(new UnsavedEventRecord('', new Value(0), EventStore.Event.Type.delete));
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
          a = stringify(new UnsavedEventRecord('', new EventStore.Value(), EventStore.Event.Type.delete));
          assert(a === e);
          a = stringify(compose('', []));
          assert(a === e);
        });

        it('put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot));
          assert(a === e);
          a = stringify(compose('a', [new UnsavedEventRecord('a', new Value(0))]));
          assert(a === e);
        });

        it('snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot));
          assert(a === e);
          a = stringify(compose('a', [new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot)]));
          assert(a === e);
        });

        it('delete', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord('a', new EventStore.Value(), EventStore.Event.Type.delete));
          assert(a === e);
          a = stringify(compose('a', [new UnsavedEventRecord('a', <Value>new EventStore.Value(), EventStore.Event.Type.delete)]));
          assert(a === e);
        });

      });

      describe('put', () => {
        it('override', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0)),
            new UnsavedEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0)),
            new UnsavedEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot),
            new UnsavedEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot),
            new UnsavedEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.delete),
            new UnsavedEventRecord('a', new Value(1))
          ]));
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.delete),
            new UnsavedEventRecord('a', new Value(''))
          ]));
          assert(a === e);
        });

      });

      describe('snapshot', () => {
        it('override', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot),
            new UnsavedEventRecord('a', new Value(1), EventStore.Event.Type.snapshot)
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot),
            new UnsavedEventRecord('a', new Value(''), EventStore.Event.Type.snapshot)
          ]));
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.put),
            new UnsavedEventRecord('a', new Value(1), EventStore.Event.Type.snapshot)
          ]));
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.put),
            new UnsavedEventRecord('a', new Value(''), EventStore.Event.Type.snapshot)
          ]));
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.delete),
            new UnsavedEventRecord('a', new Value(1), EventStore.Event.Type.snapshot)
          ]));
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"id":0,"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.delete),
            new UnsavedEventRecord('a', new Value(''), EventStore.Event.Type.snapshot)
          ]));
          assert(a === e);
        });

      });

      describe('delete', () => {
        it('override', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.delete),
            new UnsavedEventRecord('a', new Value(1), EventStore.Event.Type.delete)
          ]));
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.delete),
            new UnsavedEventRecord('a', new Value(''), EventStore.Event.Type.delete)
          ]));
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.put),
            new UnsavedEventRecord('a', new Value(1), EventStore.Event.Type.delete)
          ]));
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.put),
            new UnsavedEventRecord('a', new Value(''), EventStore.Event.Type.delete)
          ]));
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot),
            new UnsavedEventRecord('a', new Value(1), EventStore.Event.Type.delete)
          ]));
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"id":0,"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose('a', [
            new UnsavedEventRecord('a', new Value(0), EventStore.Event.Type.snapshot),
            new UnsavedEventRecord('a', new Value(''), EventStore.Event.Type.delete)
          ]));
          assert(a === e);
        });

      });

    });

    it('CRUD', done => {
      open('test', Store.configure('test'));
      const es = new Store<string, Value>('test', 'test');

      assert(es.meta('a').id === 0);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date === 0);
      assert(es.has('a') === false);
      assert(es.get('a').value === void 0);
      es.add(new UnsavedEventRecord('a', new Value(0)));
      assert(es.meta('a').id === 0);
      assert(es.meta('a').key === 'a');
      assert(es.meta('a').date > 0);
      assert(es.has('a') === true);
      assert(es.get('a').value === 0);
      es.events.save
        .once(['a', 'value', 'put'], () => {
          assert(es.meta('a').id === 1);
          assert(es.meta('a').key === 'a');
          assert(es.meta('a').date > 0);
          assert(es.has('a') === true);
          assert(es.get('a').value === 0);
          es.delete('a');
          assert(es.meta('a').id === 1);
          assert(es.meta('a').key === 'a');
          assert(es.meta('a').date > 0);
          assert(es.has('a') === false);
          assert(es.get('a').value === void 0);
          es.events.save
            .once(['a', '', 'delete'], () => {
              assert(es.meta('a').id === 2);
              assert(es.meta('a').key === 'a');
              assert(es.meta('a').date > 0);
              assert(es.has('a') === false);
              assert(es.get('a').value === void 0);
              done();
            });
        });
    });

    it('sync', done => {
      open('test', Store.configure('test'));
      const es = new Store<string, Value>('test', 'test');

      let cnt = 0;
      es.sync([''], err => {
        assert(++cnt === 1);
        assert.deepStrictEqual(err, []);
      });
      es.sync([''], err => {
        assert(++cnt === 2);
        assert.deepStrictEqual(err, []);
        es.sync([''], err => {
          assert(++cnt === 3);
          assert.deepStrictEqual(err, []);
          done();
        });
      });
    });

    it('transaction', done => {
      open('test', Store.configure('test'));
      const es = new Store<string, Value>('test', 'test');

      es.add(new UnsavedEventRecord('', new Value(0)));
      es.transaction('', () => {
        assert(es.meta('').id === 0);
        assert(es.get('').value === 0);
        es.fetch('', err => {
          assert(!err);
          assert(es.meta('').id === 2);
          assert(es.get('').value === 1);
          done();
        });
        es.add(new UnsavedEventRecord('', new Value(es.get('').value + 1)));
        assert(es.meta('').id === 0);
        assert(es.get('').value === 1);
      }, err => assert(!err));
    });

    it('clean', done => {
      open('test', Store.configure('test'));
      const es = new Store<string, Value>('test', 'test');

      es.add(new UnsavedEventRecord('a', new Value(0)));
      es.add(new UnsavedEventRecord('b', new Value(0)));
      es.events.save
        .once(['a', 'value', 'put'], () => {
          es.delete('a');
          es.events.save
            .once(['a', '', 'delete'], () => {
              assert(es.meta('a').id === 3);
              assert(es.has('a') === false);
              assert(es.get('a').value === void 0);
              assert(es.meta('b').id === 2);
              assert(es.has('b') === true);
              assert(es.get('b').value === 0);
              setTimeout(() => {
                assert(es.meta('a').id === 0);
                assert(es.has('a') === false);
                assert(es.meta('b').id === 2);
                assert(es.has('b') === true);
                done();
              }, 1000);
            });
        });
    });

    it('snapshot', done => {
      open('test', Store.configure('test'));
      const es = new Store<string, Value>('test', 'test');

      Promise.resolve()
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(1)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(2)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(3)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(4)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(5)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(6)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(7)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(8)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
          }))
        .then(() =>
          new Promise(resolve => {
            es.add(new UnsavedEventRecord('a', new Value(9)));
            es.events.save.once(['a', 'value', 'put'], () => resolve());
            es.events.save.once(['a', '', 'snapshot'], ev => {
              assert(ev.id === 10);
              assert(ev.key === 'a');
              assert(ev.attr === '');
              assert(ev.type === 'snapshot');
              assert(es.meta('a').id === 10);
              assert(es.get('a').value === 9);

              for (let i = 0; i < 9; ++i) {
                es.add(new UnsavedEventRecord('a', new Value(i + ev.id + 1)));
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

  });

});
