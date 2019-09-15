import { StorageChannelObject } from '../../../../../';
import { StorageChannel } from './channel';
import { storageEventStream_ } from '../../../infrastructure/webstorage/api';

describe('Unit: layers/domain/webstorage/service/channel', () => {
  describe('spec', () => {
    interface DAO extends StorageChannelObject {
    }
    class DAO {
      n = 0;
    }

    before(() => {
      sessionStorage.removeItem('test');
    });

    afterEach(() => {
      sessionStorage.removeItem('test');
    });

    it('resource', () => {
      const chan = new StorageChannel('test', sessionStorage, () => new DAO());
      assert.throws(() => new StorageChannel('test', sessionStorage, () => new DAO()));
      chan.destroy();
    });

    it('make/destroy', () => {
      assert(sessionStorage.getItem('test') === null);
      const chan = new StorageChannel('test', sessionStorage, () => new DAO());
      const link = chan.link();
      assert(link.n === 0);
      assert(sessionStorage.getItem('test') === null);
      link.n = 1;
      assert(link.n === 1);
      assert(sessionStorage.getItem('test') === '{\"n\":1}');
      chan.destroy();
      assert(link.n === 1);
      assert(sessionStorage.getItem('test') === null);
    });

    it('remake', () => {
      assert(sessionStorage.getItem('test') === null);
      const chan = new StorageChannel('test', sessionStorage, () => new DAO());
      assert(chan.link() === chan.link());
      chan.destroy();
      new StorageChannel('test', sessionStorage, () => new DAO())
        .destroy();
      assert(sessionStorage.getItem('test') === null);
    });

    it('update', () => {
      const chan = new StorageChannel('test', sessionStorage, () => new DAO());
      const link = chan.link();
      assert(link.n === 0);
      link.n = 1;
      assert(link.n === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 1);
      link.n = 0;
      assert(link.n === 0);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 0);
      chan.destroy();
    });

    it('migrate', () => {
      sessionStorage.setItem('test', JSON.stringify({ n: 0 }));
      const chan = new StorageChannel('test', sessionStorage, () => new DAO(), v => {
        if (v.n % 2) return;
        v.n += 1;
      });
      const link = chan.link();
      assert(link.n === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 1);
      sessionStorage.setItem('test', JSON.stringify({ n: 2 }));
      storageEventStream_.emit(['session', chan.name], { newValue: '{"n": 2}' } as StorageEvent)
      assert(link.n === 3);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 3);
      chan.destroy();
    });

  });

});
