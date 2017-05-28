import { StorageChannelObject } from '../../../../../';
import { StorageChannel } from './channel';
import { eventstream_ } from '../../../infrastructure/webstorage/api';

describe('Unit: layers/domain/webstorage/service/channel', () => {
  describe('spec', () => {
    interface DAO extends StorageChannelObject {
    }
    class DAO {
      n = 0;
    }
    function factory() {
      return new DAO();
    }

    before(() => {
      sessionStorage.removeItem('test');
    });

    afterEach(() => {
      sessionStorage.removeItem('test');
    });

    it('resource', () => {
      const chan = new StorageChannel('test', sessionStorage, factory);
      assert.throws(() => new StorageChannel('test', sessionStorage, factory));
      chan.destroy();
    });

    it('make/destroy', () => {
      assert(sessionStorage.getItem('test') === null);
      const chan = new StorageChannel('test', sessionStorage, factory);
      const dao = chan.link();
      assert(dao.n === 0);
      assert(sessionStorage.getItem('test') === null);
      dao.n = 1;
      assert(dao.n === 1);
      assert(sessionStorage.getItem('test') === '{\"n\":1}');
      chan.destroy();
      assert(dao.n === 1);
      assert(sessionStorage.getItem('test') === null);
    });

    it('remake', () => {
      assert(sessionStorage.getItem('test') === null);
      const chan = new StorageChannel('test', sessionStorage, factory);
      assert(chan.link() === chan.link());
      chan.destroy();
      new StorageChannel('test', sessionStorage, factory);
      chan.destroy();
      assert(sessionStorage.getItem('test') === null);
    });

    it('update', () => {
      const chan = new StorageChannel('test', sessionStorage, factory);
      const dao = chan.link();
      assert(dao.n === 0);
      dao.n = 1;
      assert(dao.n === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 1);
      dao.n = 0;
      assert(dao.n === 0);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 0);
      chan.destroy();
    });

    it('migrate', () => {
      sessionStorage.setItem('test', JSON.stringify({ n: 0 }));
      const chan = new StorageChannel('test', sessionStorage, factory, v => {
        if (v.n % 2) return;
        v.n += 1;
      });
      const dao = chan.link();
      assert(dao.n === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 1);
      sessionStorage.setItem('test', JSON.stringify({ n: 2 }));
      eventstream_.emit(['session', chan.name], <StorageEvent>{ newValue: '{"n": 2}' })
      assert(dao.n === 3);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 3);
      chan.destroy();
    });

  });

});
