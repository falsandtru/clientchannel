import { uuid } from 'spica';

export const supportWebStorage: boolean = (() => {
  try {
    const key = 'localsocket#' + uuid();
    void self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw 1;
    void self.sessionStorage.removeItem(key);
    return true;
  }
  catch (e) {
    return false;
  }
})();

export const localStorage: Storage | undefined = supportWebStorage ? self.localStorage : void 0;
export const sessionStorage: Storage | undefined = supportWebStorage ? self.sessionStorage : void 0;
