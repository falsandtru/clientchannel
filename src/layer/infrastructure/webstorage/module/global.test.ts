import {localStorage, sessionStorage, supportWebStorage} from './global';

describe('Unit: layers/infrastructure/webstorage/module/global', () => {
  describe('webStorage', () => {
    it('supportWebStorage', () => {
      assert(supportWebStorage);
    });

    it('localStorage', () => {
      assert(localStorage);
    });

    it('sessionStorage', () => {
      assert(sessionStorage);
    });

  });

});
