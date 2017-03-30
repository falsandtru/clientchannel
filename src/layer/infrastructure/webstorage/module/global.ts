import { uuid } from 'spica';

export const supportWebStorage: boolean = (() => {
  try {
    if (!window.navigator.cookieEnabled) throw void 0;
    const key = 'clientchannel#' + uuid();
    void self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw void 0;
    void self.sessionStorage.removeItem(key);
    return true;
  }
  catch (_) {
    return false;
  }
})();

export const localStorage: Storage | undefined = supportWebStorage ? self.localStorage : void 0;
export const sessionStorage: Storage | undefined = supportWebStorage ? self.sessionStorage : void 0;
