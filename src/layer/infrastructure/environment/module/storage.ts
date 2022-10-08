import { uuid } from 'spica/uuid';

export let isStorageAvailable = verifyStorageAccess();

export function verifyStorageAccess(): boolean {
  try {
    if (!self.navigator.cookieEnabled) throw undefined;
    const key = 'clientchannel#' + uuid();
    self.sessionStorage.setItem(key, key);
    if (key !== self.sessionStorage.getItem(key)) throw undefined;
    self.sessionStorage.removeItem(key);
    return isStorageAvailable = true;
  }
  catch {
    return isStorageAvailable = false;
  }
}
