import {Storage, StorageValue, StorageRecord} from './storage';
import {KeyString, IDBKey, IDBValue} from '../types';
import {open, destroy, event, Config, IDBEventName} from '../../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/schema/storage', function () {
  this.timeout(5 * 1e3);

  describe('spec', () => {
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

    class CustomStorageValue extends StorageValue {
      constructor(
        public val: number
      ) {
        super();
      }
    }

    it('recent', done => {
      const storage = new Storage<CustomStorageValue>('test', _ => false);

      storage.recent(Infinity, (keys, err) => {
        assert(!err);
        assert.deepEqual(keys, []);
        storage.recent(Infinity, (keys, err) => {
          storage.add(new StorageRecord(KeyString('a'), new CustomStorageValue(0)));
          setTimeout(() => {
            storage.recent(Infinity, (keys, err) => {
              assert(!err);
              assert.deepEqual(keys, ['a']);
              setTimeout(() => {
                storage.recent(0, (keys, err) => {
                  assert(!err);
                  assert.deepEqual(keys, []);
                  setTimeout(() => {
                    storage.recent(Infinity, (keys, err) => {
                      assert(!err);
                      assert.deepEqual(keys, ['a']);
                      storage.add(new StorageRecord(KeyString('b'), new CustomStorageValue(0)));
                      setTimeout(() => {
                        storage.recent(Infinity, (keys, err) => {
                          assert(!err);
                          assert.deepEqual(keys, ['b', 'a']);
                          done();
                        });
                      }, 100);
                    });
                  }, 100);
                });
              }, 100);
            });
          }, 100);
        });
      });
    });

    it('clean', done => {
      const storage = new Storage<CustomStorageValue>('test', _ => false);

      storage.clean();
      setTimeout(() => {
        storage.add(new StorageRecord(KeyString('a'), new CustomStorageValue(0)));
        storage.clean();
        storage.keys(keys => {
          assert.deepEqual(keys, ['a']);
          assert(storage.has('a'));
          storage.delete('a');
          storage.add(new StorageRecord(KeyString('b'), new CustomStorageValue(0)));
          storage.clean();
          storage.keys(keys => {
            assert.deepEqual(keys, ['b']);
            assert(!storage.has('a'));
            assert(storage.has('b'));
            storage.delete('b');
            storage.clean(0);
            storage.keys(keys => {
              assert.deepEqual(keys, ['b']);
              assert(!storage.has('a'));
              assert(!storage.has('b'));
              storage.clean(Infinity);
              storage.keys(keys => {
                assert.deepEqual(keys, []);
                assert(!storage.has('a'));
                assert(!storage.has('b'));
                done();
              });
            });
          });
        });
      }, 10);
    });

    it('autoclean', done => {
      const storage = new Storage<CustomStorageValue>('test', _ => false);

      storage.add(new StorageRecord(KeyString('a'), new CustomStorageValue(0)));
      storage.keys(keys => {
        assert.deepEqual(keys, ['a']);
        storage.delete('a');
        storage.add(new StorageRecord(KeyString('b'), new CustomStorageValue(0)));
        setTimeout(() => {
          storage.keys(keys => {
            assert.deepEqual(keys, ['b']);
            done();
          });
        }, 10);
      });

    });
  });

});
