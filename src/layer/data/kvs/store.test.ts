import { KeyValueStore } from './store';
import { open, destroy, idbEventStream, Config, IDBEventType } from '../../infrastructure/indexeddb/api';

describe('Unit: layers/data/kvs/store', function () {
  this.timeout(9 * 1e3);

  describe('spec', () => {
    class Store<K extends string, V extends IDBValidValue> extends KeyValueStore<K, V> {
      public static override configure(): Config {
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

    beforeEach(done => {
      idbEventStream.once(['test', IDBEventType.destroy], () =>
        idbEventStream.once(['test', IDBEventType.disconnect], () => done()));
      destroy('test');
    });

    it('CRUD', async () => {
      const kvs = new Store<string, number>('test', '', open('test', Store.configure()));

      assert(await new Promise(resolve => kvs.set('a', 0, resolve)) === null);
      assert(await new Promise(resolve => kvs.load('a', resolve)) === null);
      assert(kvs.get('a') === 0);
      assert(await new Promise(resolve => kvs.set('a', 1, resolve)) === null);
      assert(await new Promise(resolve => kvs.load('a', resolve)) === null);
      assert(kvs.get('a') === 1);
      assert(await new Promise(resolve => kvs.delete('a', resolve)) === null);
      assert(kvs.get('a') === undefined);
      assert(await new Promise(resolve => kvs.load('a', resolve)) === null);
      assert(kvs.get('a') === undefined);
    });

  });

});
