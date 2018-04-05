import { uuid } from 'spica/uuid';

const supportsWebStorage: boolean = (() => {
  try {
    if (!self.navigator.cookieEnabled) throw void 0;
    const key = 'clientchannel#' + uuid();
    void self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw void 0;
    void self.sessionStorage.removeItem(key);
    return true;
  }
  catch {
    return false;
  }
})();

export const localStorage: Storage | undefined = supportsWebStorage ? self.localStorage : void 0;
export const sessionStorage: Storage | undefined = supportsWebStorage ? self.sessionStorage : void 0;
