import { StoreChannelObject } from '../../../../../';
import { StoreChannel } from './channel';
import { listen_, destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';
import { record } from '../../../data/es/store';
import { Schema } from '../../dao/api';

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

    interface Value extends StoreChannelObject<string> {
    }
    class Value {
      public n: number = 0;
      public s: string = '';
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
      assert(link[Schema.id] === 0);
      assert(link[Schema.key] === 'a');
      assert(link[Schema.date] === 0);
      assert(link.n === 0);
      assert(link.s === '');

      chan.destroy();
    });

    it('sync', done => {
      const chan = new StoreChannel('test', () => new Value());

      listen_('test', db => {
        db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { n: 1 })));
        db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { s: '1' }))).onsuccess = () => {
          chan.sync(['a', 'z'], 1000).then(results => {
            assert.deepStrictEqual(results, [
              { status: 'fulfilled', value: 'a' },
              { status: 'fulfilled', value: 'z' },
            ]);
            const link = chan.link('a');
            assert(link[Schema.id] === 2);
            assert(link[Schema.key] === 'a');
            assert(link[Schema.date] > 0);
            assert(link.n === 1);
            assert(link.s === '1');
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
          db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { n: 1 })));
          db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { s: '1' }))).onsuccess = () => {
            chan.load('a', err => {
              assert(!err);
              const link = chan.link('a');
              assert(link[Schema.id] === 2);
              assert(link[Schema.key] === 'a');
              assert(link[Schema.date] > 0);
              assert(link.n === 1);
              assert(link.s === '1');
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

      link[Schema.event].once(['send', 'n'], ev => {
        assert.deepEqual(ev, {
          type: 'send',
          attr: 'n',
          newValue: 1,
          oldValue: 0
        });
        chan.events.save.once(['a', 'n', 'put'], () => {
          assert(link[Schema.id] === 1);
          assert(link[Schema.key] === 'a');
          assert(link[Schema.date] > 0);
          chan.destroy();
          done();
        });
      });

      assert(link.n === 0);
      link.n = 1;
      assert(link[Schema.id] === 0);
      assert(link[Schema.key] === 'a');
      assert(link[Schema.date] > 0);
      assert(link.n === 1);
      assert(link.s === '');
    });

    it('recv', done => {
      const chan = new StoreChannel('test', () => new Value());
      const link = chan.link('a');

      assert(link.n === 0);
      listen_('test', db => {
        db.transaction('data', 'readwrite').objectStore('data').put(record(new StoreChannel.Record('a', { n: 1 }))).onsuccess = () => {
          chan['schema'].data.load('a');
          link[Schema.event].once(['recv', 'n'], () => {
            assert(link[Schema.id] === 1);
            assert(link[Schema.key] === 'a');
            assert(link[Schema.date] > 0);
            assert(link.n === 1);
            chan.destroy();
            done();
          });
        };
      });
    });

    it('migrate', (done) => {
      let chan = new StoreChannel('test', () => new Value());
      const link = chan.link('a');
      link.n = 1;
      chan.events.save.once(['a', 'n', 'put'], () => {
        chan.close();
        chan = new StoreChannel('test', () => new Value(), {
          migrate: link => {
            assert(link[Schema.id] === 1);
            assert(link.n === 1);
            link.n = 2;
          }
        });
        const link = chan.link('a');
        chan.events.load.once(['a', 'n', 'put'], () => {
          assert(link.n === 2);
          chan.events.save.once(['a', 'n', 'put'], () => {
            assert(link[Schema.id] === 2);
            chan.destroy();
            done();
          });
        });
      });
    });

  });

});
