import {assign} from 'arch-stream';
import {repository} from './store';

describe('Unit: layers/domain/webstorage/repository/store', () => {
  describe('repository', () => {
    class DAO {
      n = 0;
    }
    function factory() {
      return new DAO();
    }
    const schema = {
      __key: 'test'
    };

    before(() => {
      sessionStorage.removeItem('test');
    });

    afterEach(() => {
      sessionStorage.removeItem('test');
    });

    it('make/destroy', () => {
      assert(sessionStorage.getItem('test') === null);
      const repo = repository('test', sessionStorage, factory);
      repo.link();
      assert.deepEqual(JSON.parse(sessionStorage.getItem('test')), assign<{}>({}, schema, factory()));
      repo.destroy();
      assert(sessionStorage.getItem('test') === null);
    });

    it('remake', () => {
      assert(sessionStorage.getItem('test') === null);
      const repo = repository('test', sessionStorage, factory);
      repo.link();
      assert.deepEqual(JSON.parse(sessionStorage.getItem('test')), assign<{}>({}, schema, factory()));
      repo.link();
      assert.deepEqual(JSON.parse(sessionStorage.getItem('test')), assign<{}>({}, schema, factory()));
      repo.destroy();
      assert(sessionStorage.getItem('test') === null);
    });

    it('update', () => {
      const repo = repository('test', sessionStorage, factory);
      const dao = repo.link();
      assert(dao.n === 0);
      dao.n = 1;
      assert(dao.n === 1);
      assert(JSON.parse(sessionStorage.getItem('test')).n === 1);
      dao.n = 0;
      assert(dao.n === 0);
      assert(JSON.parse(sessionStorage.getItem('test')).n === 0);
      repo.destroy();
    });

  });

});
