import { StoreChannelObject } from '../../../../../';
import { ChannelStore } from './channel';
import { destroy, event, IDBEventType } from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/channel', function () {
  this.timeout(9 * 1e3);

  describe('spec', () => {
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

    interface CustomSocketValue extends StoreChannelObject<string> { }
    class CustomSocketValue {
      constructor(
        public val: number
      ) {
      }
    }

    it('resource', () => {
      const chan = new ChannelStore('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity);
      assert.throws(() => new ChannelStore('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity));
      chan.destroy();
    });

    it('recent', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity);

      chan.recent(Infinity, (keys, err) => {
        assert(!err);
        assert.deepStrictEqual(keys, []);
        chan.recent(Infinity, () => {
          chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
          setTimeout(() => {
            chan.recent(Infinity, (keys, err) => {
              assert(!err);
              assert.deepStrictEqual(keys, ['a']);
              setTimeout(() => {
                chan.recent(0, (keys, err) => {
                  assert(!err);
                  assert.deepStrictEqual(keys, []);
                  setTimeout(() => {
                    chan.recent(Infinity, (keys, err) => {
                      assert(!err);
                      assert.deepStrictEqual(keys, ['a']);
                      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
                      setTimeout(() => {
                        chan.recent(Infinity, (keys, err) => {
                          assert(!err);
                          assert.deepStrictEqual(keys, ['b', 'a']);
                          chan.destroy();
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
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      chan.recent(Infinity, keys => {
        assert.deepStrictEqual(keys, ['a']);
        assert(chan.has('a') === true);
        chan.delete('a');
        chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
        chan.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['b']);
          assert(chan.has('a') === false);
          assert(chan.has('b') === true);
          chan.delete('b');
          chan.recent(Infinity, keys => {
            assert.deepStrictEqual(keys, []);
            assert(chan.has('a') === false);
            assert(chan.has('b') === false);
            chan.destroy();
            done();
          });
        });
      });
    });

    it('expiry', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, 4000);

      chan.expire('a');
      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      chan.expire('b', 1000);
      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      chan.add(new ChannelStore.Record('c', new CustomSocketValue(0)));
      setTimeout(() => {
        chan.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['c', 'a']);
          assert(chan.has('a') === true);
          assert(chan.has('b') === false);
          assert(chan.has('c') === true);
          setTimeout(() => {
            chan.recent(Infinity, keys => {
              assert.deepStrictEqual(keys, ['c']);
              assert(chan.has('a') === false);
              assert(chan.has('b') === false);
              assert(chan.has('c') === true);
              chan.destroy();
              done();
            });
          }, 3000);
        });
      }, 3000);
    });

  });

});
