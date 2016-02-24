import {meta} from './meta';
import {webstorage} from '../api';

describe('Unit: layers/domain/webstorage/service/meta', () => {
  describe('meta', () => {
    class DAO {
      n = 0;
    }
    function factory() {
      return new DAO();
    }

    before(() => {
      localStorage.removeItem('meta');
      localStorage.removeItem('test');
    });

    afterEach(() => {
      localStorage.removeItem('meta');
      localStorage.removeItem('test');
    });

    it('make/destroy', () => {
      const repo = webstorage('test', localStorage, factory, 1);
      assert('test' in meta.expires === false);
      const dao = repo.link();
      assert(dao.n === 0);
      assert('test' in meta.expires === true);
      assert(meta.expires['test'].name === 'test');
      assert(meta.expires['test'].expire.life === 1);
      assert(meta.expires['test'].expire.rest === 1);
      assert(meta.expires['test'].expire.atime > 0);
      repo.destroy();
      assert('test' in meta.expires === false);
    });

  });

});
