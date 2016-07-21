import { KeyValueStore } from './key-value';
import { IDBValue } from '../constraint/types';
import { open, destroy, event, Config, IDBEventType } from '../../infrastructure/indexeddb/api';

describe('Unit: layers/data/store/key-value', function (this: Mocha) {
  this.timeout(5 * 1e3);

  describe('spec', () => {
    class Store<K extends string, V extends IDBValue> extends KeyValueStore<K, V> {
      public static configure(): Config {
        return {
          make(db) {
            if (db.objectStoreNames.contains('test')) {
              db.deleteObjectStore('test');
            }
            void db.createObjectStore('test', {
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
