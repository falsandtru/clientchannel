import { StoreChannelObject } from '../../../../../';
import { StoreChannel } from './channel';
import { listen, destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { adjust } from '../../../data/es/store';

describe('Unit: layers/domain/indexeddb/service/channel', function () {
  this.timeout(5 * 1e3);

  describe('spec', () => {
    before(done => {
      idbEventStream
        .once(['test', IDBEventType.destroy], () =>
          idbEventStream
            .once(['test', IDBEventType.disconnect], () => done())
        );
      destroy('test');
    });

    afterEach(done => {
      idbEventStream
        .once(['test', IDBEventType.destroy], () =>
          idbEventStream
            .once(['test', IDBEventType.disconnect], () => done())
        );
      destroy('test');
    });

    interface Value extends StoreChannelObject<string> {
    }
    class Value {
      public n: number = 0;
      public s: string = '';
    }

    it('resource', () => {
      const chan = new StoreChannel('test', Value);
      assert.throws(() => new StoreChannel('test', Value));
      chan.destroy();
    });

    it('link', () => {
      const chan = new StoreChannel('test', Value);
      const link = chan.link('a');

      assert(link === chan.link('a'));
      assert(link.__id === 0);
      assert(link.__key === 'a');
      assert(link.__date === 0);
      assert(link.n === 0);
      assert(link.s === '');

      chan.destroy();
    });

    it('sync', done => {
      const chan = new StoreChannel('test', Value);

      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new StoreChannel.Record('a', { n: 1 })));
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new StoreChannel.Record('a', { s: '1' }))).onsuccess = () => {
          chan.sync(['a'], errs => {
            assert.deepStrictEqual(errs, []);
            const link = chan.link('a');
            assert(link.__id === 2);
            assert(link.__key === 'a');
            assert(link.__date > 0);
            assert(link.n === 1);
            assert(link.s === '1');
            chan.destroy();
            done();
          });
        };
      });
    });

    it('fetch', done => {
      const chan = new StoreChannel('test', Value);

      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new StoreChannel.Record('a', { n: 1 })));
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new StoreChannel.Record('a', { s: '1' }))).onsuccess = () => {
          chan.fetch('a', err => {
            assert(!err);
            const link = chan.link('a');
            assert(link.__id === 2);
            assert(link.__key === 'a');
            assert(link.__date > 0);
            assert(link.n === 1);
            assert(link.s === '1');
            chan.destroy();
            done();
          });
        };
      });
    });

    it('send', done => {
      const chan = new StoreChannel('test', Value);
      const link = chan.link('a');

      link.__event.once(['send', 'n'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          attr: 'n',
          newValue: 1,
          oldValue: 0
        });
        chan.events.save.once(['a', 'n', 'put'], () => {
          assert(link.__id === 1);
          assert(link.__key === 'a');
          assert(link.__date > 0);
          chan.destroy();
          done();
        });
      });

      assert(link.n === 0);
      link.n = 1;
      assert(link.__id === 0);
      assert(link.__key === 'a');
      assert(link.__date > 0);
      assert(link.n === 1);
      assert(link.s === '');
    });

    it('recv', done => {
      const chan = new StoreChannel('test', Value);
      const link = chan.link('a');

      assert(link.n === 0);
      listen('test')(db => {
        db.transaction('data', 'readwrite').objectStore('data').put(adjust(new StoreChannel.Record('a', { n: 1 }))).onsuccess = () => {
          chan['schema'].data.fetch('a');
          link.__event.once(['recv', 'n'], () => {
            assert(link.__id === 1);
            assert(link.__key === 'a');
            assert(link.__date > 0);
            assert(link.n === 1);
            chan.destroy();
            done();
          });
        };
      });
    });

    it('migrate', (done) => {
      let chan = new StoreChannel('test', Value);
      const link = chan.link('a');
      link.n = 1;
      chan.events.save.once(['a', 'n', 'put'], () => {
        chan.close();
        chan = new StoreChannel('test', Value, link => {
          assert(link.__id === 1);
          assert(link.n === 1);
          link.n = 2;
        });
        const link = chan.link('a');
        chan.events.load.once(['a', 'n', 'put'], () => {
          assert(link.n === 2);
          chan.events.save.once(['a', 'n', 'put'], () => {
            assert(link.__id === 2);
            chan.destroy();
            done();
          });
        });
      });
    });

  });

});
