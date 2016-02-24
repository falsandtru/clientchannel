import {compose, AbstractEventStore, UnsavedEventRecord, EventValue, SavedEventRecord, EventType} from './event';
import {open, destroy, event, Config, Access, IDBEventName} from '../../../../infrastructure/indexeddb/api';
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

    describe('EventRecord', () => {
      it('put', () => {
        const e = '{"type":"put","key":"","value":{"value":0},"attr":"value"}';
        const a = stringify(new UnsavedEventRecord(KeyString(''), new Value(0)));
        assert(a === e);
      });

      it('snapshot', () => {
        const e = '{"type":"snapshot","key":"","value":{"value":0},"attr":""}';
        const a = stringify(new UnsavedEventRecord(KeyString(''), new Value(0), EventType.snapshot));
        assert(a === e);
      });

      it('delete', () => {
        const e = '{"type":"delete","key":"","value":{},"attr":""}';
        const a = stringify(new UnsavedEventRecord(KeyString(''), new Value(0), EventType.delete));
        assert(a === e);
      });

    });

    describe('compress', () => {
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
          a = stringify(new UnsavedEventRecord(KeyString(''), new EventValue(), EventType.delete));
          assert(a === e);
          a = stringify(compose([])[0]);
          assert(a === e);
        });

        it('put', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot));
          assert(a === e);
          a = stringify(compose([new UnsavedEventRecord(KeyString('a'), new Value(0))])[0]);
          assert(a === e);
        });

        it('snapshot', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot));
          assert(a === e);
          a = stringify(compose([new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot)])[0]);
          assert(a === e);
        });

        it('delete', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          let a = '';
          a = stringify(new UnsavedEventRecord(KeyString('a'), new EventValue(), EventType.delete));
          assert(a === e);
          a = stringify(compose([new UnsavedEventRecord(KeyString('a'), <Value>new EventValue(), EventType.delete)])[0]);
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
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(1))
          ])[0]);
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":0,"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(''))
          ])[0]);
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(1))
          ])[0]);
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(''))
          ])[0]);
          assert(a === e);
        });

      });

      describe('snapshot', () => {
        it('override', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventType.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventType.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.put),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventType.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.put),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventType.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('override after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"number":1},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventType.snapshot)
          ])[0]);
          assert(a === e);
        });

        it('merge after delete', () => {
          const e = '{"type":"snapshot","key":"a","value":{"string":""},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventType.snapshot)
          ])[0]);
          assert(a === e);
        });

      });

      describe('delete', () => {
        it('override', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventType.delete)
          ])[0]);
          assert(a === e);
        });

        it('merge', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.delete),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventType.delete)
          ])[0]);
          assert(a === e);
        });

        it('override after put', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.put),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventType.delete)
          ])[0]);
          assert(a === e);
        });

        it('merge after put', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.put),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventType.delete)
          ])[0]);
          assert(a === e);
        });

        it('override after snapshot', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(1), EventType.delete)
          ])[0]);
          assert(a === e);
        });

        it('merge after snapshot', () => {
          const e = '{"type":"delete","key":"a","value":{},"attr":""}';
          const a = stringify(compose([
            new UnsavedEventRecord(KeyString('a'), new Value(0), EventType.snapshot),
            new UnsavedEventRecord(KeyString('a'), new Value(''), EventType.delete)
          ])[0]);
          assert(a === e);
        });

      });

    });

    it('CRUD', done => {
      const es = new EventStore<Value>(open('test', EventStore.configure('test')), 'test');

      assert(es.head(KeyString('a')) === 0);
      assert(es.has(KeyString('a')) === false);
      assert(es.get(KeyString('a')).value === void 0);
      es.add(new UnsavedEventRecord(KeyString('a'), new Value(0)));
      assert(es.head(KeyString('a')) === 0);
      assert(es.has(KeyString('a')) === true);
      assert(es.get(KeyString('a')).value === 0);
      es.events.save
        .once(['a', 'value', 'put'], _ => {
          assert(es.head(KeyString('a')) === 1);
          assert(es.has(KeyString('a')) === true);
          assert(es.get(KeyString('a')).value === 0);
          es.delete(KeyString('a'));
          es.events.save
            .once(['a', '', 'delete'], _ => {
              setTimeout(() => {
                //assert(es.head(KeyString('a')) === 2);
                assert(es.has(KeyString('a')) === false);
                assert(es.get(KeyString('a')).value === void 0);
                done();
              }, 10);
            });
        });
    });

    it('keys', done => {
      const es = new EventStore<Value>(open('test', EventStore.configure('test')), 'test');

      es.add(new UnsavedEventRecord(KeyString('a'), new Value(0)));
      es.add(new UnsavedEventRecord(KeyString('a'), new Value(0)));
      es.add(new UnsavedEventRecord(KeyString('b'), new Value(0)));
      es.add(new UnsavedEventRecord(KeyString('b'), new Value(0)));
      es.add(new UnsavedEventRecord(KeyString('c'), new Value(0)));
      es.add(new UnsavedEventRecord(KeyString('c'), new Value(0)));

      es.keys(keys => {
        assert.deepEqual(keys, [
          'c',
          'b',
          'a'
        ]);
        done();
      });
    });

    it('clean', done => {
      const es = new EventStore<Value>(open('test', EventStore.configure('test')), 'test');

      es.add(new UnsavedEventRecord(KeyString('a'), new Value(0)));
      es.events.save
        .once(['a', 'value', 'put'], _ => {
          assert(es.head(KeyString('a')) === 1);
          assert(es.has(KeyString('a')) === true);
          assert(es.get(KeyString('a')).value === 0);
          es.clean(0);
          setTimeout(() => {
            assert(es.head(KeyString('a')) === 1);
            assert(es.has(KeyString('a')) === true);
            assert(es.get(KeyString('a')).value === 0);
            es.clean(Infinity);
            setTimeout(() => {
              assert(es.head(KeyString('a')) === 1);
              assert(es.has(KeyString('a')) === true);
              assert(es.get(KeyString('a')).value === 0);
              es.delete(KeyString('a'));
              es.events.save
                .once(['a', '', 'delete'], _ => {
                  //assert(es.head(KeyString('a')) === 2);
                  assert(es.has(KeyString('a')) === false);
                  assert(es.get(KeyString('a')).value === void 0);
                  es.clean(0);
                  setTimeout(() => {
                    //assert(es.head(KeyString('a')) === 2);
                    es.clean(Infinity);
                    setTimeout(() => {
                      assert(es.head(KeyString('a')) === 0);
                      done();
                    }, 100);
                  }, 10);
                });
            }, 10);
          }, 10);
        });
    });

    it('autoclean', done => {
      const es = new EventStore<Value>(open('test', EventStore.configure('test')), 'test');

      for (let i = 0; i < 11; ++i) {
        es.add(new UnsavedEventRecord(KeyString('a'), new Value(i + 1)));
      }
      setTimeout(() => {
        assert(es.head(KeyString('a')) === 12);
        assert(es.get(KeyString('a')).value === 11);
        done();
      }, 1000);
    });

    it('eventcompless', done => {
      const es = new EventStore<Value>(open('test', EventStore.configure('test')), 'test');

      for (let i = 0; i < 5; ++i) {
        es.add(new UnsavedEventRecord(KeyString('a'), new Value(i + 1)));
      }
      setTimeout(() => {
        const es = new EventStore<Value>(open('test', EventStore.configure('test')), 'test');
        es.get(KeyString('a'));
        es.events.load
          .on(['a', 'value', 'put'], _ => {
            assert(es.head(KeyString('a')) === 5);
            assert(es.has(KeyString('a')) === true);
            assert(es.get(KeyString('a')).value === 5);
            setTimeout(done, 10);
          });
      }, 1000);
    });

  });

});
