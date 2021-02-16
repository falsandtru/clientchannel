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

      chan.recent().then(keys => {
        assert.deepStrictEqual(keys, []);
        chan.recent().then(() => {
          chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
          setTimeout(() => {
            chan.recent().then(keys => {
              assert.deepStrictEqual(keys, ['a']);
              setTimeout(() => {
                chan.recent(0).catch(() => {
                  setTimeout(() => {
                    chan.recent().then(keys => {
                      assert.deepStrictEqual(keys, ['a']);
                      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
                      setTimeout(() => {
                        chan.recent().then(keys => {
                          assert.deepStrictEqual(keys, ['b', 'a']);
                          chan.destroy();
                          done();
                        });
                      }, 1000);
                    });
                  }, 1000);
                });
              }, 1000);
            });
          }, 1000);
        });
      });
    });

    it('clean', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, Infinity);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      chan.recent().then(keys => {
        assert.deepStrictEqual(keys, ['a']);
        assert(chan.has('a') === true);
        chan.delete('a');
        chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
        chan.events.save.once(['a', '', ChannelStore.EventType.delete], () => {
          setTimeout(() => {
            chan.recent().then(keys => {
              assert.deepStrictEqual(keys, ['b']);
              assert(chan.has('a') === false);
              assert(chan.has('b') === true);
              chan.delete('b');
              chan.events.save.once(['b', '', ChannelStore.EventType.delete], () => {
                setTimeout(() => {
                  chan.recent().then(keys => {
                    assert.deepStrictEqual(keys, []);
                    assert(chan.has('a') === false);
                    assert(chan.has('b') === false);
                    chan.destroy();
                    done();
                  });
                }, 1000);
              });
            });
          }, 1000);
        });
      });
    });

    it.skip('age', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, 6000, Infinity);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      chan.expire('b', 1000);
      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      chan.add(new ChannelStore.Record('c', new CustomSocketValue(0)));
      chan.events.save.once(['b', '', ChannelStore.EventType.delete], () => {
        setTimeout(() => {
          chan.recent().then(keys => {
            assert.deepStrictEqual(keys, ['c', 'a']);
            assert(chan.has('a') === true);
            assert(chan.has('b') === false);
            assert(chan.has('c') === true);
            chan.events.save.once(['c', '', ChannelStore.EventType.delete], () => {
              setTimeout(() => {
                chan.recent().then(keys => {
                  assert.deepStrictEqual(keys, []);
                  assert(chan.has('a') === false);
                  assert(chan.has('b') === false);
                  assert(chan.has('c') === false);
                  chan.destroy();
                  done();
                });
              }, 1000);
            });
          });
        }, 1000);
      });
    });

    it.skip('size', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', Object.keys(new CustomSocketValue(0)), () => true, Infinity, 1);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      assert(chan.has('a') === true);
      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      assert(chan.has('a') === true);
      assert(chan.has('b') === true);
      chan.events.save.once(['a', '', ChannelStore.EventType.delete], () => {
        assert(chan.has('a') === false);
        setTimeout(() => {
          chan.recent().then(keys => {
            assert.deepStrictEqual(keys, ['b']);
            assert(chan.has('b') === true);
            chan.destroy();
            done();
          });
        }, 1000);
      });
    });

  });

});
