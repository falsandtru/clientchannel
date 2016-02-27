import {clean} from './clean';
import {meta} from './meta';
import {webstorage} from '../api';

describe('Unit: layers/domain/webstorage/service/clean', () => {
  describe('clean', () => {
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

    it('clean', () => {
      const repo = webstorage('test', localStorage, factory, 1);
      const dao = repo.link();
      assert(localStorage.getItem('test') === "{\"__key\":\"test\",\"n\":0}");
      clean(meta, localStorage);
      assert(localStorage.getItem('test') === "{\"__key\":\"test\",\"n\":0}");
      clean(meta, localStorage);
      assert(localStorage.getItem('test') === "{\"__key\":\"test\",\"n\":0}");
      clean(meta, localStorage, Date.now() + 1e3 * 3600 * 24 * 1);
      clean(meta, localStorage, Date.now() + 1e3 * 3600 * 24 * 2);
      assert(localStorage.getItem('test') === null);
      assert('test' in meta.expires === false);
      dao.n = 1;
      assert(localStorage.getItem('test') === "{\"__key\":\"test\",\"n\":1}");
      repo.destroy();
      assert(localStorage.getItem('test') === null);
      assert('test' in meta.expires === false);
    });

  });

});
