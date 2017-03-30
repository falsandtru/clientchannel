import { localStorage, sessionStorage, supportWebStorage } from './global';

describe('Unit: layers/infrastructure/webstorage/module/global', () => {
  describe('webStorage', () => {
    it('supportWebStorage', () => {
      assert(supportWebStorage);
      assert(supportWebStorage === window.navigator.cookieEnabled);
    });

    it('localStorage', () => {
      assert(localStorage);
    });

    it('sessionStorage', () => {
      assert(sessionStorage);
    });

  });

});
