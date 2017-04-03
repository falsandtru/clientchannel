import { StoreChannelObject } from '../../../../../';
import { ChannelStore } from './channel';
import { destroy, event, IDBEventType } from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/channel', function () {
  this.timeout(5 * 1e3);

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

    it('singleton', () => {
      assert(new ChannelStore('test', () => true, Infinity) === new ChannelStore('test', () => true, Infinity));
      new ChannelStore('test', () => true, Infinity).destroy();
    });

    it('recent', done => {
      const channel = new ChannelStore<string, CustomSocketValue>('test', () => true, Infinity);

      channel.recent(Infinity, (keys, err) => {
        assert(!err);
        assert.deepStrictEqual(keys, []);
        channel.recent(Infinity, () => {
          channel.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
          setTimeout(() => {
            channel.recent(Infinity, (keys, err) => {
              assert(!err);
              assert.deepStrictEqual(keys, ['a']);
              setTimeout(() => {
                channel.recent(0, (keys, err) => {
                  assert(!err);
                  assert.deepStrictEqual(keys, []);
                  setTimeout(() => {
                    channel.recent(Infinity, (keys, err) => {
                      assert(!err);
                      assert.deepStrictEqual(keys, ['a']);
                      channel.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
                      setTimeout(() => {
                        channel.recent(Infinity, (keys, err) => {
                          assert(!err);
                          assert.deepStrictEqual(keys, ['b', 'a']);
                          channel.destroy();
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
      const channel = new ChannelStore<string, CustomSocketValue>('test', () => true, Infinity);

      channel.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      channel.recent(Infinity, keys => {
        assert.deepStrictEqual(keys, ['a']);
        assert(channel.has('a') === true);
        channel.delete('a');
        channel.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
        channel.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['b']);
          assert(channel.has('a') === false);
          assert(channel.has('b') === true);
          channel.delete('b');
          channel.recent(Infinity, keys => {
            assert.deepStrictEqual(keys, []);
            assert(channel.has('a') === false);
            assert(channel.has('b') === false);
            channel.destroy();
            done();
          });
        });
      });
    });

    it('expiry', done => {
      const channel = new ChannelStore<string, CustomSocketValue>('test', () => true, 3000);

      channel.expire('a');
      channel.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      channel.expire('b', 1000);
      channel.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      channel.add(new ChannelStore.Record('c', new CustomSocketValue(0)));
      setTimeout(() => {
        channel.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['c', 'a']);
          assert(channel.has('a') === true);
          assert(channel.has('b') === false);
          assert(channel.has('c') === true);
          setTimeout(() => {
            channel.recent(Infinity, keys => {
              assert.deepStrictEqual(keys, ['c']);
              assert(channel.has('a') === false);
              assert(channel.has('b') === false);
              assert(channel.has('c') === true);
              channel.destroy();
              done();
            });
          }, 2000);
        });
      }, 2000);
    });

  });

});
