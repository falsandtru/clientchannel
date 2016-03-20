import {compose, AbstractEventStore, UnsavedEventRecord, EventValue, SavedEventRecord, EventTypes, ESEventTypes} from './event';
import {open, listen, destroy, event, Config, Access, IDBEventName} from '../../../../infrastructure/indexeddb/api';
import {KeyString} from '../types';

describe('Unit: layers/domain/indexeddb/model/store/event', function () {
  this.timeout(5 * 1e3);

  describe('spec', () => {
    class Value extends EventValue {
      constructor(
        public value: number
      ) {
        super();
      }
    }
    class EventStore<T extends EventValue> extends AbstractEventStore<T> {
      constructor(access: Access, name: string) {
        super(access, name);
      }
    }
    function stringify<T extends EventValue>(e: UnsavedEventRecord<T> | SavedEventRecord<T>): string {
      return JSON.stringify(e)
        .replace(/"date":\s?\d+,\s?/, '');
    }

    before(done => {
      event
        .once(['test', IDBEventName.destroy], _ =>
          event
            .once(['test', IDBEventName.disconnect], _ => done())
        );
      destroy('test');
    });

    afterEach(done => {
      event
        .once(['test', IDBEventName.destroy], _ =>
          event
            .once(['test', IDBEventName.disconnect], _ => done())
        );
      destroy('test');
    });

    describe('ESEventType', () => {
      it('compare', () => {
        assert(EventTypes[EventTypes.put] === ESEventTypes.put);
        assert(EventTypes[EventTypes.snapshot] === ESEventTypes.snapshot);
        assert(EventTypes[EventTypes.delete] === ESEventTypes.delete);
      });

    });

    describe('EventRecord', () => {
      it('put', () => {
        const e = '{"type":"put","key":"","value":{"value":0},"attr":"value"}';
        const a = stringify(new UnsavedEventRecord(KeyString(''), new Value(0)));
        assert(a === e);
      });

      it('snapshot', () => {
        const e = '{"type":"snapshot","key":"","value":{"value":0},"attr":""}';
        const a = stringify(new UnsavedEventRecord(KeyString(''), new Value(0), EventTypes.snapshot));
        assert(a === e);
      });

      it('delete', () => {
        const e = '{"type":"delete","key":"","value":{},"attr":""}';
        const a = stringify(new UnsavedEventRecord(KeyString(''), new Value(0), EventTypes.delete));
        assert(a === e);
      });

    });

    describe('compose', () => {
      class Value extends EventValue {
        constructor(
          value: any
        ) {
          super();
          if (value === null) return;
          this[typeof value] = value;
        }
      }
      class EventStore<T extends EventValue> extends AbstractEventStore<T> {
      }

      describe('single', () => {
        it('empty', () => {
          const e = '{"type":"delete","key":"","value":{},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString(''), new EventValue(), EventTypes.delete));
          assert(a === e);
          a = stringify(compose([])[0]);
          assert(a === e);
        });

        it('put', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot));
          assert(a === e);
          a = stringify(compose([new UnsavedEventRecord(KeyString('a'), new Value(0))])[0]);
          assert(a === e);
        });

        it('snapshot', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot));
          assert(a === e);
          a = stringify(compose([new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot)])[0]);
          assert(a === e);
        });

        it('delete', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString('a'), new EventValue(), EventTypes.delete));
          assert(a === e);
          a = stringify(compose([new UnsavedEventRecord(KeyString('a'), <Value>new EventValue(), EventTypes.delete)])[0]);
          assert(a === e);
        });

      });

      describe('put', () => {
        it('override', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0)),
            new UnsavedEventRecord(KeyString('a'), new Value(1))
          ])[0]);
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0)),
            new UnsavedEventRecord(KeyString('a'), new Value(''))
          ])[0]);
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(1))
          ])[0]);
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(''))
          ])[0]);
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(1))
          ])[0]);
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(''))
          ])[0]);
          assert(a === e);
        });

      });

      describe('snapshot', () => {
        it('override', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventTypes.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventTypes.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.put),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventTypes.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.put),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventTypes.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventTypes.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventTypes.snapshot)
          ])[0]);
          assert(a === e);
        });

      });

      describe('delete', () => {
        it('override', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventTypes.delete)
          ])[0]);
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventTypes.delete)
          ])[0]);
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.put),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventTypes.delete)
          ])[0]);
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.put),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventTypes.delete)
          ])[0]);
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventTypes.delete)
          ])[0]);
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventTypes.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventTypes.delete)
          ])[0]);
          assert(a === e);
        });

      });

    });

    it('CRUD', done => {
      open('test', EventStore.configure('test'));
      const es = new EventStore<Value>(listen('test'), 'test');

      assert(es.meta(KeyString('a')).id === 0);
      assert(es.has(KeyString('a')) === false);
      assert(es.get(KeyString('a')).value === void 0);
      es.add(new UnsavedEventRecord(KeyString('a'), new Value(0)));
      assert(es.meta(KeyString('a')).id === 0);
      assert(es.has(KeyString('a')) === true);
      assert(es.get(KeyString('a')).value === 0);
      es.events.save
        .once([KeyString('a'), 'value', 'put'], _ => {
          assert(es.meta(KeyString('a')).id === 1);
          assert(es.has(KeyString('a')) === true);
          assert(es.get(KeyString('a')).value === 0);
          es.delete(KeyString('a'));
          assert(es.meta(KeyString('a')).id === 1);
          assert(es.has(KeyString('a')) === false);
          assert(es.get(KeyString('a')).value === void 0);
          es.events.save
            .once([KeyString('a'), '', 'delete'], _ => {
              assert(es.meta(KeyString('a')).id === 2);
              assert(es.has(KeyString('a')) === false);
              assert(es.get(KeyString('a')).value === void 0);
              done();
            });
        });
    });

    it('sync', done => {
      open('test', EventStore.configure('test'));
      const es = new EventStore<Value>(listen('test'), 'test');

      let cnt = 0;
      es.sync([KeyString('')], err => {
        assert(++cnt === 1);
        assert.deepEqual(err, [void 0]);
      });
      es.sync([KeyString('')], err => {
        assert(++cnt === 2);
        assert.deepEqual(err, [void 0]);
        es.sync([KeyString('')], err => {
          assert(++cnt === 3);
          assert.deepEqual(err, [void 0]);
          done();
        });
      });
    });

    it('clean', done => {
      open('test', EventStore.configure('test'));
      const es = new EventStore<Value>(listen('test'), 'test');

      es.add(new UnsavedEventRecord(KeyString('a'), new Value(0)));
      es.add(new UnsavedEventRecord(KeyString('b'), new Value(0)));
      es.events.save
        .once([KeyString('a'), 'value', 'put'], _ => {
          es.delete(KeyString('a'));
          es.events.save
            .once([KeyString('a'), '', 'delete'], _ => {
              assert(es.meta(KeyString('a')).id === 3);
              assert(es.has(KeyString('a')) === false);
              assert(es.get(KeyString('a')).value === void 0);
              assert(es.meta(KeyString('b')).id === 2);
              assert(es.has(KeyString('b')) === true);
              assert(es.get(KeyString('b')).value === 0);
              setTimeout(() => {
                assert(es.meta(KeyString('a')).id === 0);
                assert(es.has(KeyString('a')) === false);
                assert(es.meta(KeyString('b')).id === 2);
                assert(es.has(KeyString('b')) === true);
                done();
              }, 1000);
            });
        });
    });

    it('snapshot', done => {
      open('test', EventStore.configure('test'));
      const es = new EventStore<Value>(listen('test'), 'test');

      for (let i = 0; i < 11; ++i) {
        es.add(new UnsavedEventRecord(KeyString('a'), new Value(i + 1)));
      }
      setTimeout(() => {
        assert(es.meta(KeyString('a')).id === 12);
        assert(es.get(KeyString('a')).value === 11);
        done();
      }, 1000);
    });

  });

});
