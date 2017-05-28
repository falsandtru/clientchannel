import { StoreChannelObject } from '../../../../../';
import { StoreChannel } from './channel';
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

    it('resource', () => {
      const chan = new StoreChannel('test', () => new Value(0, ''));
      assert.throws(() => new StoreChannel('test', () => new Value(0, '')));
      chan.destroy();
    });

    it('link', () => {
      const chan = new StoreChannel('test', () => new Value(0, ''));
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
      const chan = new StoreChannel('test', () => new Value(0, ''));
      const dao = chan.link('a');

      dao.__event.once(['send', 'n'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          attr: 'n',
          newValue: 1,
          oldValue: 0
        });
        chan.events.save.once(['a', 'n', 'put'], () => {
          assert(dao.__id === 1);
          assert(dao.__key === 'a');
          assert(dao.__date > 0);
          chan.destroy();
          done();
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
      const chan = new StoreChannel('test', () => new Value(0, ''));
      const dao = chan.link('a');

      assert(dao.n === 0);
      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new StoreChannel.Record('a', { n: 1 }))).onsuccess = () => {
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

    it('migrate', (done) => {
      let chan = new StoreChannel('test', () => new Value(0, ''));
      const dao = chan.link('a');
      dao.n = 1;
      chan.events.save.once(['a', 'n', 'put'], () => {
        chan.close();
        chan = new StoreChannel('test', () => new Value(0, ''), dao => {
          assert(dao.__id === 1);
          assert(dao.n === 1);
          dao.n = 2;
        });
        const dao = chan.link('a');
        chan.events.load.once(['a', 'n', 'put'], () => {
          assert(dao.n === 2);
          chan.events.save.once(['a', 'n', 'put'], () => {
            assert(dao.__id === 2);
            chan.destroy();
            done();
          });
        });
      });
    });

  });

});
