import { StoreChannel } from './channel';
import { listen_, destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { record } from '../../../data/es/store';

describe('Unit: layers/domain/indexeddb/service/channel', function () {
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

    interface Value extends StoreChannel.Value<string> {
    }
    class Value {
      public num = 0;
      public str = '';
    }

    it('resource', () => {
      const chan = new StoreChannel('test', () => new Value());
      assert.throws(() => new StoreChannel('test', () => new Value()));
      chan.destroy();
    });

    it('link', () => {
      const chan = new StoreChannel('test', () => new Value());
      const link = chan.link('a');

      assert(link === chan.link('a'));
      assert(link[StoreChannel.Value.id] === 0);
      assert(link[StoreChannel.Value.key] === 'a');
      assert(link[StoreChannel.Value.date] === 0);
      assert(link.num === 0);
      assert(link.str === '');

      chan.destroy();
    });

    it('sync', done => {
      const chan = new StoreChannel('test', () => new Value());

      listen_('test', db => {
        db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { num: 1 })));
        db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { str: '1' }))).onsuccess = () => {
          chan.sync(['a', 'z'], 1000).then(results => {
            assert.deepStrictEqual(results, [
              { status: 'fulfilled', value: 'a' },
              { status: 'fulfilled', value: 'z' },
            ]);
            const link = chan.link('a');
            assert(link[StoreChannel.Value.id] === 2);
            assert(link[StoreChannel.Value.key] === 'a');
            assert(link[StoreChannel.Value.date] > 0);
            assert(link.num === 1);
            assert(link.str === '1');
            chan.destroy();
            done();
          });
        };
      });
    });

    it('load', done => {
      const chan = new StoreChannel('test', () => new Value());

      chan.load('z', err => {
        assert(!err);
        listen_('test', db => {
          db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { num: 1 })));
          db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { str: '1' }))).onsuccess = () => {
            chan.load('a', err => {
              assert(!err);
              const link = chan.link('a');
              assert(link[StoreChannel.Value.id] === 2);
              assert(link[StoreChannel.Value.key] === 'a');
              assert(link[StoreChannel.Value.date] > 0);
              assert(link.num === 1);
              assert(link.str === '1');
              chan.destroy();
              done();
            });
          };
        });
      });
    });

    it('send', done => {
      const chan = new StoreChannel('test', () => new Value());
      const link = chan.link('a');

      link[StoreChannel.Value.event].once(['send', 'num'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          prop: 'num',
          newValue: 1,
          oldValue: 0
        });
        chan.events.save.once(['a', 'num', 'put'], () => {
          assert(link[StoreChannel.Value.id] === 1);
          assert(link[StoreChannel.Value.key] === 'a');
          assert(link[StoreChannel.Value.date] > 0);
          chan.destroy();
          done();
        });
      });

      assert(link.num === 0);
      link.num = 1;
      assert(link[StoreChannel.Value.id] === 0);
      assert(link[StoreChannel.Value.key] === 'a');
      assert(link[StoreChannel.Value.date] > 0);
      assert(link.num === 1);
      assert(link.str === '');
    });

    it('recv', done => {
      const chan = new StoreChannel('test', () => new Value());
      const link = chan.link('a');

      assert(link.num === 0);
      listen_('test', db => {
        db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { num: 1 }))).onsuccess = () => {
          chan['schema'].data.load('a');
          link[StoreChannel.Value.event].once(['recv', 'num'], ev => {
            assert.deepEqual(ev, {
              type: 'recv',
              prop: 'num',
              newValue: 1,
              oldValue: 0
            });
            chan.events.load.once(['a', 'num', 'put'], () => {
              assert(link[StoreChannel.Value.id] === 1);
              assert(link[StoreChannel.Value.key] === 'a');
              assert(link[StoreChannel.Value.date] > 0);
              assert(link.num === 1);
              chan.destroy();
              done();
            });
          });
        };
      });
    });

    it('migrate', (done) => {
      let chan = new StoreChannel('test', () => new Value());
      const link = chan.link('a');
      link.num = 1;
      chan.events.save.once(['a', 'num', 'put'], () => {
        chan.close();
        chan = new StoreChannel('test', () => new Value(), {
          migrate: link => {
            assert(link[StoreChannel.Value.id] === 1);
            assert(link.num === 1);
            link.num = 2;
          }
        });
        const link = chan.link('a');
        chan.events.load.once(['a', 'num', 'put'], () => {
          assert(link.num === 2);
          chan.events.save.once(['a', 'num', 'put'], () => {
            assert(link[StoreChannel.Value.id] === 2);
            chan.destroy();
            done();
          });
        });
      });
    });

  });

});
