import { uuid } from 'spica/uuid';

export let isStorageAvailable = verifyStorageAccess();

export function verifyStorageAccess(): boolean {
  try {
    if (!self.navigator.cookieEnabled) throw void 0;
    const key = 'clientchannel#' + uuid();
    void self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw void 0;
    void self.sessionStorage.removeItem(key);
    return isStorageAvailable = true;
  }
  catch {
    return isStorageAvailable = false;
  }
}
