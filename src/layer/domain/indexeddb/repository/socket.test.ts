import {LocalSocketObject} from 'localsocket';
import {socket} from './socket';
import {KeyString} from '../../../data/constraint/types';
import {SocketStore, SocketRecord} from '../model/socket';
import {listen, destroy, event, Config, IDBEventType} from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/repository/socket', function () {
  this.timeout(5 * 1e3);

  describe('spec', () => {
    before(done => {
      event
        .once(['test', IDBEventType.destroy], _ =>
          event
            .once(['test', IDBEventType.disconnect], _ => done())
        );
      destroy('test');
    });

    afterEach(done => {
      event
        .once(['test', IDBEventType.destroy], _ =>
          event
            .once(['test', IDBEventType.disconnect], _ => done())
        );
      destroy('test');
    });

    interface Value extends LocalSocketObject {
    }
    class Value {
      constructor(
        public n: number,
        public s: string
      ) {
      }
    }

    it('link', done => {
      const sock = socket('test', () => new Value(0, ''), () => true);
      const dao = sock.link('a');

      assert(dao === sock.link('a'));
      assert(dao.__id === 0);
      assert(dao.__key === 'a');
      assert(dao.__date === 0);
      assert(dao.n === 0);
      assert(dao.s === '');

      sock.destroy();
      done();
    });

    it('send', done => {
      const sock = socket('test', () => new Value(0, ''), () => true);
      const dao = sock.link('a');

      dao.__event.once(['send', 'n'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          key: 'a',
          attr: 'n',
          newValue: 1,
          oldValue: 0
        });
        sock.events.save.once(['a', 'n', 'put'], ev => {
          assert(dao.__id === 1);
          assert(dao.__key === 'a');
          assert(dao.__date > 0);
          setTimeout(() => {
            assert(localStorage.getItem('test').replace(/\d+/, '0') === '{"msgs":[{"key":"a","attr":"n","date":0}]}');
            sock.destroy();
            done();
          }, 0);
        });
      });

      assert(dao.n === 0);
      dao.n = 1;
      assert(dao.__id === 0);
      assert(dao.__key === 'a');
      assert(dao.__date > 0);
      assert(dao.n === 1);
      assert(dao.s === '');
    });

    it('recv', done => {
      const sock = socket('test', () => new Value(0, ''), () => true);
      const dao = sock.link('a');

      assert(dao.n === 0);
      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(new SocketRecord(KeyString('a'), { n: 1 })).onsuccess = _ => {
          sock['schema'].data.update(KeyString('a'));
          dao.__event.once(['recv', 'n'], ev => {
            assert(dao.__id === 1);
            assert(dao.__key === 'a');
            assert(dao.__date > 0);
            assert(dao.n === 1);
            sock.destroy();
            done();
          });
        };
      });
    });

  });

});
