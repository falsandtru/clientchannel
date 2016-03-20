import {AbstractKeyValueStore} from './key-value';
import {IDBKey, IDBValue} from '../types';
import {open, listen, destroy, event, Config, IDBEventName} from '../../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/store/key-value', function () {
  this.timeout(5 * 1e3);

  describe('spec', () => {
    class KeyValueStore<K extends string, V extends IDBValue> extends AbstractKeyValueStore<K, V> {
      public static configure(): Config {
        return {
          make(db) {
            if (db.objectStoreNames.contains('test')) {
              db.deleteObjectStore('test');
            }
            const store = db.createObjectStore('test', {
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

    it('CRUD', done => {
      open('test', KeyValueStore.configure());
      const kvs = new KeyValueStore<string, number>(listen('test'), 'test', '');

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
