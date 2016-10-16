import { LocalSocketObject } from 'localsocket';
import { Socket } from './socket';
import { SocketStore } from '../model/socket';
import { listen, destroy, event, IDBEventType } from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/service/socket', function (this: Mocha) {
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

    interface Value extends LocalSocketObject<string> {
    }
    class Value {
      constructor(
        public n: number,
        public s: string
      ) {
      }
    }

    it('singleton', () => {
      assert(new Socket('test', () => new Value(0, '')) === new Socket('test', () => new Value(0, '')));
      new Socket('test', () => new Value(0, '')).destroy();
    });

    it('link', () => {
      const sock = new Socket('test', () => new Value(0, ''));
      const dao = sock.link('a');

      assert(dao === sock.link('a'));
      assert(dao.__id === 0);
      assert(dao.__key === 'a');
      assert(dao.__date === 0);
      assert(dao.n === 0);
      assert(dao.s === '');

      sock.destroy();
    });

    it('send', done => {
      const sock = new Socket('test', () => new Value(0, ''));
      const dao = sock.link('a');

      dao.__event.once(['send', 'n'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          key: 'a',
          attr: 'n',
          newValue: 1,
          oldValue: 0
        });
        sock.events.save.once(['a', 'n', 'put'], () => {
          assert(dao.__id === 1);
          assert(dao.__key === 'a');
          assert(dao.__date > 0);
          setTimeout(() => {
            assert(localStorage.getItem('test')!.replace(/\d+/, '0') === '{"msgs":[{"key":"a","attr":"n","date":0}]}');
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
      const sock = new Socket('test', () => new Value(0, ''));
      const dao = sock.link('a');

      assert(dao.n === 0);
      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(Object.assign({}, new SocketStore.Record('a', { n: 1 }))).onsuccess = () => {
          sock['schema'].data.fetch('a');
          dao.__event.once(['recv', 'n'], () => {
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