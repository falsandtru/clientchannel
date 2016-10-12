import { SocketStore } from './socket';
import { destroy, event, IDBEventType } from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/socket', function (this: Mocha) {
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

    class CustomSocketValue extends SocketStore.Value<string> {
      constructor(
        public val: number
      ) {
        super();
      }
    }

    it('recent', done => {
      const socket = new SocketStore<string, CustomSocketValue>('test', () => true);

      socket.recent(Infinity, (keys, err) => {
        assert(!err);
        assert.deepStrictEqual(keys, []);
        socket.recent(Infinity, () => {
          socket.add(new SocketStore.Record('a', new CustomSocketValue(0)));
          setTimeout(() => {
            socket.recent(Infinity, (keys, err) => {
              assert(!err);
              assert.deepStrictEqual(keys, ['a']);
              setTimeout(() => {
                socket.recent(0, (keys, err) => {
                  assert(!err);
                  assert.deepStrictEqual(keys, []);
                  setTimeout(() => {
                    socket.recent(Infinity, (keys, err) => {
                      assert(!err);
                      assert.deepStrictEqual(keys, ['a']);
                      socket.add(new SocketStore.Record('b', new CustomSocketValue(0)));
                      setTimeout(() => {
                        socket.recent(Infinity, (keys, err) => {
                          assert(!err);
                          assert.deepStrictEqual(keys, ['b', 'a']);
                          socket.destroy();
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
      const socket = new SocketStore<string, CustomSocketValue>('test', () => true);

      socket.add(new SocketStore.Record('a', new CustomSocketValue(0)));
      socket.recent(Infinity, keys => {
        assert.deepStrictEqual(keys, ['a']);
        assert(socket.has('a') === true);
        socket.delete('a');
        socket.add(new SocketStore.Record('b', new CustomSocketValue(0)));
        socket.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['b']);
          assert(socket.has('a') === false);
          assert(socket.has('b') === true);
          socket.delete('b');
          socket.recent(Infinity, keys => {
            assert.deepStrictEqual(keys, []);
            assert(socket.has('a') === false);
            assert(socket.has('b') === false);
            socket.destroy();
            done();
          });
        });
      });
    });

    it('expiry', done => {
      const socket = new SocketStore<string, CustomSocketValue>('test', () => true, 3000);

      socket.expire('a');
      socket.add(new SocketStore.Record('a', new CustomSocketValue(0)));
      socket.expire('b', 100);
      socket.add(new SocketStore.Record('b', new CustomSocketValue(0)));
      socket.add(new SocketStore.Record('c', new CustomSocketValue(0)));
      setTimeout(() => {
        socket.recent(Infinity, keys => {
          assert.deepStrictEqual(keys, ['c', 'a']);
          assert(socket.has('a') === true);
          assert(socket.has('b') === false);
          assert(socket.has('c') === true);
          setTimeout(() => {
            socket.recent(Infinity, keys => {
              assert.deepStrictEqual(keys, ['c']);
              assert(socket.has('a') === false);
              assert(socket.has('b') === false);
              assert(socket.has('c') === true);
              socket.destroy();
              done();
            });
          }, 2000);
        });
      }, 1000);

    });

  });

});
