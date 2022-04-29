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

    interface CustomSocketValue extends ChannelStore.Value<string> { }
    class CustomSocketValue {
      constructor(
        public value: number
      ) {
      }
    }

    it('resource', () => {
      const chan = new ChannelStore('test', () => true, Infinity, Infinity);
      assert.throws(() => new ChannelStore('test', () => true, Infinity, Infinity));
      chan.destroy();
    });

    it('recent', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', () => true, Infinity, Infinity);

      chan.recent().then(keys => {
        assert.deepStrictEqual(keys, []);
        chan.recent().then(() => {
          chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
          chan.events.save.once(['a', 'value', ChannelStore.EventType.put], () => {
            chan.recent().then(keys => {
              assert.deepStrictEqual(keys, ['a']);
              chan.recent(0).catch(() => {
                chan.recent().then(keys => {
                  assert.deepStrictEqual(keys, ['a']);
                  chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
                  chan.events.save.once(['b', 'value', ChannelStore.EventType.put], () => {
                    chan.recent().then(keys => {
                      assert.deepStrictEqual(keys, ['b', 'a']);
                      chan.destroy();
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

    it('clean', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', () => true, Infinity, Infinity);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      chan.recent().then(keys => {
        assert.deepStrictEqual(keys, ['a']);
        assert(chan.has('a') === true);
        chan.delete('a');
        chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
        chan.events.save.once(['a', '', ChannelStore.EventType.delete], () => {
          chan.recent().then(keys => {
            assert.deepStrictEqual(keys, ['b']);
            assert(chan.has('a') === false);
            assert(chan.has('b') === true);
            chan.delete('b');
            chan.events.save.once(['b', '', ChannelStore.EventType.delete], () => {
              chan.recent().then(keys => {
                assert.deepStrictEqual(keys, []);
                assert(chan.has('a') === false);
                assert(chan.has('b') === false);
                chan.destroy();
                done();
              });
            });
          });
        });
      });
    });

    it('age', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', () => true, Infinity, Infinity);

      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      chan.expire('b', 100);
      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      chan.add(new ChannelStore.Record('c', new CustomSocketValue(0)));
      chan.events.save.once(['b', '', ChannelStore.EventType.delete], () => {
        chan.recent().then(keys => {
          assert.deepStrictEqual(keys, ['c', 'a']);
          assert(chan.has('a') === true);
          assert(chan.has('b') === false);
          assert(chan.has('c') === true);
          chan.destroy();
          done();
        });
      });
    });

    it('size', done => {
      const chan = new ChannelStore<string, CustomSocketValue>('test', () => true, Infinity, 2);

      chan.add(new ChannelStore.Record('b', new CustomSocketValue(0)));
      for (let until = Date.now() + 1; Date.now() < until;); // Wait
      chan.add(new ChannelStore.Record('a', new CustomSocketValue(0)));
      for (let until = Date.now() + 1; Date.now() < until;); // Wait
      chan.add(new ChannelStore.Record('c', new CustomSocketValue(0)));
      assert(chan.has('b') === true);
      assert(chan.has('a') === true);
      assert(chan.has('c') === true);
      chan.events.save.once(['b', '', ChannelStore.EventType.delete], () => {
        assert(chan.has('b') === false);
        chan.recent().then(keys => {
          assert.deepStrictEqual(keys, ['c', 'a']);
          assert(chan.has('a') === true);
          assert(chan.has('c') === true);
          chan.destroy();
          done();
        });
      });
    });

  });

});
