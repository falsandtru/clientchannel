import {log, namespace as logns} from './log';
import {expiry, namespace as expiryns} from './expiry';
import {webstorage} from '../api';

describe('Unit: layers/domain/webstorage/service/expiry', () => {
  describe('clean', () => {
    class DAO {
      n = 0;
    }
    function factory() {
      return new DAO();
    }

    before(() => {
      localStorage.removeItem(logns);
      localStorage.removeItem(expiryns);
      localStorage.removeItem('test');
    });

    afterEach(() => {
      localStorage.removeItem(logns);
      localStorage.removeItem(expiryns);
      localStorage.removeItem('test');
    });

    it('clean', done => {
      const repo = webstorage('test', localStorage, factory, 100);
      const dao = repo.link();
      assert(log.get('test') > 0);
      assert(expiry.get('test') === 100);
      dao.n = 1;
      assert(localStorage.getItem('test') === "{\"n\":1}");
      expiry.clean();
      assert(localStorage.getItem('test') === "{\"n\":1}");
      setTimeout(() => {
        dao.n = 2;
        setTimeout(() => {
          expiry.clean();
          assert(localStorage.getItem('test') === "{\"n\":2}");
          expiry.clean(Date.now() + 200);
          assert(localStorage.getItem('test') === null);
          repo.destroy();
          assert(localStorage.getItem('test') === null);
          assert('test' in log.logs === false);
          assert('test' in expiry.expiries === false);
          done();
        }, 50);
      }, 50);
    });

  });

});
