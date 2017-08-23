import { KeyValueStore } from './store';
import { open, destroy, idbEventStream, Config, IDBEventType } from '../../infrastructure/indexeddb/api';

describe('Unit: layers/data/kvs/store', function () {
  this.timeout(9 * 1e3);

  describe('spec', () => {
    class Store<K extends string, V extends IDBValidValue> extends KeyValueStore<K, V> {
      public static configure(): Config {
        return {
          make(tx) {
            if (tx.db.objectStoreNames.contains('test')) {
              tx.db.deleteObjectStore('test');
            }
            void tx.db.createObjectStore('test', {
              autoIncrement: false
            });
            return true;
          },
          verify(db) {
            return db.objectStoreNames.contains('test');
          },
          destroy() {
            return true;
          }
        };
      }
    }

    before(done => {
      idbEventStream
        .once(['test', IDBEventType.destroy], () =>
          idbEventStream
            .once(['test', IDBEventType.disconnect], () => done())
        );
      destroy('test');
    });

    afterEach(done => {
      idbEventStream
        .once(['test', IDBEventType.destroy], () =>
          idbEventStream
            .once(['test', IDBEventType.disconnect], () => done())
        );
      destroy('test');
    });

    it('CRUD', done => {
      open('test', Store.configure());
      const kvs = new Store<string, number>('test', 'test', '');

      kvs.set('a', 0, (key, err) => {
        assert(key === 'a');
        assert(err === null);
        kvs.get('a', (value, err) => {
          assert(value === 0);
          assert(err === null);
          kvs.set('a', 1, (key, err) => {
            assert(key === 'a');
            assert(err === null);
            kvs.get('a', (value, err) => {
              assert(value === 1);
              assert(err === null);
              kvs.delete('a', (err) => {
                assert(err === null);
                kvs.get('a', (value, err) => {
                  assert(value === void 0);
                  assert(err === null);
                  done();
                });
              });
            });
          });
        });
      });
    });

  });

});
