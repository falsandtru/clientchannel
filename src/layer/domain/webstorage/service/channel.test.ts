import { StorageChannel } from './channel';
import { storageEventStream_ } from '../../../infrastructure/webstorage/api';

describe('Unit: layers/domain/webstorage/service/channel', () => {
  describe('spec', () => {
    interface DAO extends StorageChannel.Value {
    }
    class DAO {
      value = 0;
    }

    beforeEach(() => {
      sessionStorage.removeItem('test');
    });

    it('resource', () => {
      const chan = new StorageChannel('test', sessionStorage, { schema: () => new DAO() });
      assert.throws(() => new StorageChannel('test', sessionStorage, { schema: () => new DAO() }));
      chan.destroy();
    });

    it('make/destroy', () => {
      assert(sessionStorage.getItem('test') === null);
      const chan = new StorageChannel('test', sessionStorage, { schema: () => new DAO() });
      const link = chan.link();
      assert(link.value === 0);
      assert(sessionStorage.getItem('test') === null);
      link.value = 1;
      assert(link.value === 1);
      assert(sessionStorage.getItem('test') === '{\"value\":1}');
      assert(chan.unlink() === true);
      link.value = 2;
      assert(link.value === 2);
      assert(sessionStorage.getItem('test') === '{\"value\":1}');
      assert(chan.unlink() === false);
      chan.link().value = 3;

      chan.destroy();
      assert(link.value === 2);
      assert(sessionStorage.getItem('test') === null);
    });

    it('remake', () => {
      assert(sessionStorage.getItem('test') === null);
      const chan = new StorageChannel('test', sessionStorage, { schema: () => new DAO() });
      assert(chan.link() === chan.link());
      chan.destroy();
      new StorageChannel('test', sessionStorage, { schema: () => new DAO() })
        .destroy();
      assert(sessionStorage.getItem('test') === null);
    });

    it('update', () => {
      const chan = new StorageChannel('test', sessionStorage, { schema: () => new DAO() });
      const link = chan.link();
      assert(link.value === 0);
      link.value = 1;
      assert(link.value === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).value === 1);
      link.value = 0;
      assert(link.value === 0);
      assert(JSON.parse(sessionStorage.getItem('test')!).value === 0);
      chan.destroy();
    });

    it('migrate', () => {
      sessionStorage.setItem('test', JSON.stringify({ value: 0 }));
      const chan = new StorageChannel('test', sessionStorage, {
        schema: () => new DAO(),
        migrate: v => {
          if (v.value % 2) return;
          v.value += 1;
        },
      });
      const link = chan.link();
      assert(link.value === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).value === 1);
      sessionStorage.setItem('test', JSON.stringify({ value: 2 }));
      storageEventStream_.emit(['session', chan.name], { newValue: '{"value": 2}' } as StorageEvent)
      assert(link.value === 3);
      assert(JSON.parse(sessionStorage.getItem('test')!).value === 3);
      chan.destroy();
    });

  });

});
