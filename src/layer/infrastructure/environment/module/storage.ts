import { uuid } from 'spica/uuid';

export function verifyStorageAccess(): boolean {
  try {
    if (!self.navigator.cookieEnabled) throw undefined;
    const key = 'clientchannel#' + uuid();
    void self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw undefined;
    void self.sessionStorage.removeItem(key);
    return true;
  }
  catch {
    return false;
  }
}
