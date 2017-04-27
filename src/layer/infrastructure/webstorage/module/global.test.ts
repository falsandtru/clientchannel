import { localStorage, sessionStorage } from './global';

describe('Unit: layers/infrastructure/webstorage/module/global', () => {
  describe('webStorage', () => {
    it('localStorage', () => {
      assert(localStorage);
    });

    it('sessionStorage', () => {
      assert(sessionStorage);
    });

  });

});
