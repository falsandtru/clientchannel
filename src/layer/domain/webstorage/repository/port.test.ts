import { LocalPortObject } from 'localsocket';
import { port } from './port';

describe('Unit: layers/domain/webstorage/repository/port', () => {
  describe('repository', () => {
    interface DAO extends LocalPortObject {
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

    it('make/destroy', () => {
      assert(sessionStorage.getItem('test') === null);
      const repo = port('test', sessionStorage, factory);
      const dao = repo.link();
      assert(dao.__key === 'test');
      assert(dao.n === 0);
      assert(sessionStorage.getItem('test') === null);
      dao.n = 1;
      assert(dao.__key === 'test');
      assert(dao.n === 1);
      assert(sessionStorage.getItem('test') === '{\"n\":1}');
      repo.destroy();
      assert(dao.__key === 'test');
      assert(dao.n === 1);
      assert(sessionStorage.getItem('test') === null);
    });

    it('remake', () => {
      assert(sessionStorage.getItem('test') === null);
      assert.equal(
        port('test', sessionStorage, factory).link(),
        port('test', sessionStorage, factory).link()
      );
      port('test', sessionStorage, factory).destroy();
      assert(sessionStorage.getItem('test') === null);
    });

    it('update', () => {
      const repo = port('test', sessionStorage, factory);
      const dao = repo.link();
      assert(dao.n === 0);
      dao.n = 1;
      assert(dao.n === 1);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 1);
      dao.n = 0;
      assert(dao.n === 0);
      assert(JSON.parse(sessionStorage.getItem('test')!).n === 0);
      repo.destroy();
    });

  });

});
