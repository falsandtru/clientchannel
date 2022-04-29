import { open, close, destroy } from './access';
import { Config } from './state';
import { idbEventStream, IDBEventType } from './event';

describe('Unit: layers/infrastructure/indexeddb/model/access', () => {
  describe('database', function () {
    this.timeout(10 * 1e3);

    const config: Config = {
      make: state => state.db.objectStoreNames.contains('test') || !!state.db.createObjectStore('test'),
      verify: state => state.objectStoreNames.contains('test'),
      destroy: () => true
    };
    Object.freeze(config);

    beforeEach(done => {
      idbEventStream.once(['test', IDBEventType.destroy], () =>
        idbEventStream.once(['test', IDBEventType.disconnect], () => done()));
      destroy('test');
    });

    it('open', done => {
      open('test', config)(db => {
        db.transaction('test', 'readonly').objectStore('test').count().onsuccess = event => {
          assert(event.target!['result'] === 0);
          done();
        };
      });
    });

    it('close', done => {
      idbEventStream.once(['test', IDBEventType.disconnect], () => done())
      close('test');
    });

    it('destroy', done => {
      idbEventStream.once(['test', IDBEventType.destroy], () =>
        idbEventStream.once(['test', IDBEventType.disconnect], () => done()));
      destroy('test');
    });

    it('cancel opening', done => {
      idbEventStream.once(['test', IDBEventType.disconnect], () => done());
      open('test', config);
      close('test');
    });

    it('cancel closing', done => {
      close('test');
      open('test', config)(() => {
        idbEventStream.once(['test', IDBEventType.disconnect], () => done());
        close('test');
      });
    });

    it('cannot cancel destroying', done => {
      destroy('test');
      open('test', config);
      idbEventStream.once(['test', IDBEventType.destroy], () =>
        idbEventStream.once(['test', IDBEventType.disconnect], () => done()));
    });

    it('reopen after closing', done => {
      idbEventStream.once(['test', IDBEventType.disconnect], () => {
        open('test', config)(() => {
          idbEventStream.once(['test', IDBEventType.disconnect], () => done());
          close('test');
        });
      });
      close('test');
    });

    it('reopen after destroying', done => {
      idbEventStream.once(['test', IDBEventType.disconnect], () => {
        open('test', config)(() => {
          idbEventStream.once(['test', IDBEventType.disconnect], () => done());
          close('test');
        });
      });
      destroy('test');
    });

    it('concurrent', done => {
      let cnt = 0;
      open('test', config)(db => {
        db.transaction('test', 'readwrite').objectStore('test').count().onsuccess = () => {
          assert(++cnt === 1);
        };
      });
      open('test', config)(db => {
        db.transaction('test', 'readwrite').objectStore('test').count().onsuccess = () => {
          assert(++cnt === 2);
        };
      });
      open('test', config)(db => {
        db.transaction('test', 'readwrite').objectStore('test').count().onsuccess = () => {
          assert(++cnt === 3);
          idbEventStream.once(['test', IDBEventType.disconnect], () => done());
          close('test');
        };
      });
    });

  });

});
