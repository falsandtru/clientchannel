import { StoreChannelObject } from '../../../../../';
import { Channel } from './channel';
import { listen, destroy, event, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { adjust } from '../../../data/store/event';

describe('Unit: layers/domain/indexeddb/service/channel', function () {
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

    interface Value extends StoreChannelObject<string> {
    }
    class Value {
      constructor(
        public n: number,
        public s: string
      ) {
      }
    }

    it('singleton', () => {
      assert(new Channel('test', () => new Value(0, '')) === new Channel('test', () => new Value(0, '')));
      new Channel('test', () => new Value(0, '')).destroy();
    });

    it('link', () => {
      const chan = new Channel('test', () => new Value(0, ''));
      const dao = chan.link('a');

      assert(dao === chan.link('a'));
      assert(dao.__id === 0);
      assert(dao.__key === 'a');
      assert(dao.__date === 0);
      assert(dao.n === 0);
      assert(dao.s === '');

      chan.destroy();
    });

    it('send', done => {
      const chan = new Channel('test', () => new Value(0, ''));
      const dao = chan.link('a');

      dao.__event.once(['send', 'n'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          key: 'a',
          attr: 'n',
          newValue: 1,
          oldValue: 0
        });
        chan.events.save.once(['a', 'n', 'put'], () => {
          assert(dao.__id === 1);
          assert(dao.__key === 'a');
          assert(dao.__date > 0);
          setTimeout(() => {
            assert(localStorage.getItem('test')!.replace(/\d+/, '0') === '{"msgs":[{"key":"a","attr":"n","date":0}]}');
            chan.destroy();
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
      const chan = new Channel('test', () => new Value(0, ''));
      const dao = chan.link('a');

      assert(dao.n === 0);
      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new Channel.Record('a', { n: 1 }))).onsuccess = () => {
          chan['schema'].data.fetch('a');
          dao.__event.once(['recv', 'n'], () => {
            assert(dao.__id === 1);
            assert(dao.__key === 'a');
            assert(dao.__date > 0);
            assert(dao.n === 1);
            chan.destroy();
            done();
          });
        };
      });
    });

  });

});
