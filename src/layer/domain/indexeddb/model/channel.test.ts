import { StoreChannelObject } from '../../../../../';
import { ChannelStore } from './channel';
import { destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/channel', function () {
  this.timeout(9 * 1e3);

  describe('spec', () => {
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

    interface CustomSocketValue extends StoreChannelObject<string> { }
    class CustomSocketValue {
      constructor(
        public val: number
      ) {
      }
    }

    it('resource', () => {
      const chan = new ChannelStore('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, Infinity);
      assert.throws(() => new ChannelStore('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, Infinity));
      chan.destroy();
    });

    it('recent', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, Infinity);

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
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, Infinity);

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

    it('size', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, 1, Infinity);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      assert(chan.has('a') === true);
      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      assert(chan.has('a') === true);
      assert(chan.has('b') === true);
      setTimeout(() => {
        assert(chan.has('a') === false);
        chan.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['b']);
          assert(chan.has('b') === true);
          chan.destroy();
          done();
        });
      }, 4000);
    });

    it('expiry', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, 4000);

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
          }, 4000);
        });
      }, 4000);
    });

  });

});
