import {Config, event, open, listen, close, destroy} from './access';
import {IDBEventType} from './event';
import {IDBTransaction} from '../module/global';

describe('Unit: layers/infrastructure/indexeddb/model/access', () => {
  describe('database', function () {
    this.timeout(5e3);

    const config: Config = {
      make: state => state.objectStoreNames.contains('test') || !!state.createObjectStore('test'),
      verify: s => true,
      destroy: err => false
    };
    Object.freeze(config);

    before(done => {
      event
        .once(['test', IDBEventType.destroy], _ =>
          event
            .once(['test', IDBEventType.disconnect], _ => done())
        );
      destroy('test');
    });

    after(done => {
      event
        .once(['test', IDBEventType.destroy], _ =>
          event
            .once(['test', IDBEventType.disconnect], _ => done())
        );
      destroy('test');
    });

    it('open', done => {
      open('test', config);
      listen('test')
        (db => {
          db.transaction('test', IDBTransaction.readonly).objectStore('test').count().onsuccess = event => {
            assert(event.target['result'] === 0);
            done();
          };
        });
    });

    it('close', done => {
      event
        .once(['test', IDBEventType.disconnect], _ => done())
      close('test');
    });

    it('destroy', done => {
      event
        .once(['test', IDBEventType.destroy], _ =>
          event
            .once(['test', IDBEventType.disconnect], _ => done())
        );
      destroy('test');
    });

    it('cancel opening', done => {
      event
        .once(['test', IDBEventType.disconnect], _ => done());
      open('test', config);
      close('test');
    });

    it('cancel closing', done => {
      close('test');
      open('test', config);
      listen('test')
        (db => {
          event
            .once(['test', IDBEventType.disconnect], _ => done());
          close('test');
        });
    });

    it('cancel destroying', done => {
      destroy('test');
      open('test', config);
      listen('test')
        (db => {
          event
            .once(['test', IDBEventType.disconnect], _ => done());
          close('test');
        });
    });

    it('reopen after closing', done => {
      event
        .once(['test', IDBEventType.disconnect], _ => {
          open('test', config);
          listen('test')
            (db => {
              event
                .once(['test', IDBEventType.disconnect], _ => done());
              close('test');
            });
        });
      close('test');
    });

    it('reopen after destroying', done => {
      event
        .once(['test', IDBEventType.disconnect], _ => {
          open('test', config);
          listen('test')
            (db => {
              event
                .once(['test', IDBEventType.disconnect], _ => done());
              close('test');
            });
        });
      destroy('test');
    });

    it('concurrent', done => {
      // call in random order on IE
      let cnt = 0;
      open('test', config);
      listen('test')
        (db => {
          db.transaction('test', IDBTransaction.readwrite).objectStore('test').count().onsuccess = _ => {
            assert(++cnt === 1);
          };
        });
      open('test', config);
      listen('test')
        (db => {
          db.transaction('test', IDBTransaction.readwrite).objectStore('test').count().onsuccess = _ => {
            assert(++cnt === 2);
          };
        });
      open('test', config);
      listen('test')
        (db => {
          db.transaction('test', IDBTransaction.readwrite).objectStore('test').count().onsuccess = _ => {
            assert(++cnt === 3);
            event
              .once(['test', IDBEventType.disconnect], _ => done());
            close('test');
          };
        });
    });

  });

});
