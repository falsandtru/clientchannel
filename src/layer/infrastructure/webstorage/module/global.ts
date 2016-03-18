import {uuid} from 'arch-stream';
let webStorage: {
  localStorage: Storage,
  sessionStorage: Storage
} = <any>{};

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

export const localStorage: Storage = supportWebStorage ? self.localStorage : void 0;
export const sessionStorage: Storage = supportWebStorage ? self.sessionStorage : void 0;
