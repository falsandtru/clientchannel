import {expiry} from './expiry';
import {webstorage} from '../api';

describe('Unit: layers/domain/webstorage/service/expiry', () => {
  describe('expiry', () => {
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
      assert('test' in expiry.expiries === false);
      const dao = repo.link();
      assert(dao.n === 0);
      assert('test' in expiry.expiries === true);
      assert(expiry.expiries['test'].name === 'test');
      assert(expiry.expiries['test'].life.max === 1);
      assert(expiry.expiries['test'].life.value === 1);
      assert(expiry.expiries['test'].life.atime > 0);
      repo.destroy();
      assert('test' in expiry.expiries === false);
    });

  });

});
