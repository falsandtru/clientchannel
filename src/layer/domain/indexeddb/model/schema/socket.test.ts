import {SocketStore, SocketValue, SocketRecord} from './socket';
import {KeyString, IDBKey, IDBValue} from '../types';
import {open, destroy, event, Config, IDBEventName} from '../../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/schema/socket', function () {
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

    class CustomSocketValue extends SocketValue {
      constructor(
        public val: number
      ) {
        super();
      }
    }

    it('recent', done => {
      const socket = new SocketStore<CustomSocketValue>('test', _ => false);

      socket.recent(Infinity, (keys, err) => {
        assert(!err);
        assert.deepEqual(keys, []);
        socket.recent(Infinity, (keys, err) => {
          socket.add(new SocketRecord(KeyString('a'), new CustomSocketValue(0)));
          setTimeout(() => {
            socket.recent(Infinity, (keys, err) => {
              assert(!err);
              assert.deepEqual(keys, ['a']);
              setTimeout(() => {
                socket.recent(0, (keys, err) => {
                  assert(!err);
                  assert.deepEqual(keys, []);
                  setTimeout(() => {
                    socket.recent(Infinity, (keys, err) => {
                      assert(!err);
                      assert.deepEqual(keys, ['a']);
                      socket.add(new SocketRecord(KeyString('b'), new CustomSocketValue(0)));
                      setTimeout(() => {
                        socket.recent(Infinity, (keys, err) => {
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
      const socket = new SocketStore<CustomSocketValue>('test', _ => false);

      socket.add(new SocketRecord(KeyString('a'), new CustomSocketValue(0)));
      socket.recent(Infinity, keys => {
        assert.deepEqual(keys, ['a']);
        assert(socket.has('a') === true);
        socket.delete('a');
        socket.add(new SocketRecord(KeyString('b'), new CustomSocketValue(0)));
        socket.recent(Infinity, keys => {
          assert.deepEqual(keys, ['b']);
          assert(socket.has('a') === false);
          assert(socket.has('b') === true);
          socket.delete('b');
          socket.recent(Infinity, keys => {
            assert.deepEqual(keys, []);
            assert(socket.has('a') === false);
            assert(socket.has('b') === false);
            done();
          });
        });
      });
    });

    it('expiry', done => {
      const socket = new SocketStore<CustomSocketValue>('test', _ => false, 700);

      socket.expire('a');
      socket.add(new SocketRecord(KeyString('a'), new CustomSocketValue(0)));
      assert(socket.get('a').val === 0);
      socket.recent(Infinity, keys => {
        assert.deepEqual(keys, ['a']);
        assert(socket.has('a') === true);
        setTimeout(() => {
          socket.expire('b', 300);
          socket.add(new SocketRecord(KeyString('b'), new CustomSocketValue(0)));
          socket.recent(Infinity, keys => {
            assert.deepEqual(keys, ['b']);
            assert(socket.has('a') === false);
            assert(socket.has('b') === true);
            setTimeout(() => {
              socket.recent(Infinity, keys => {
                assert.deepEqual(keys, []);
                assert(socket.has('a') === false);
                assert(socket.has('b') === false);
                done();
              });
            }, 500);
          });
        }, 900);
      });

    });

  });

});
