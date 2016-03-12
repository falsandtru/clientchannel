import {repository} from '../repository/port';
import {WebStorageExpiry} from './expiry';

export function clean(expiry: WebStorageExpiry, storage: Storage, now = Date.now()): void {
  if (!storage) return;

  void expiry.entries()
    .reduce((_, [name, {life}]) => {
      if (life.atime + 1000 * 3600 * 24 > now) {
        life.value = life.max;
      }
      else {
        life.atime = now;
        void --life.value;
      }
      if (life.value < 0) {
        void repository(name, storage, () => ({}), 0, expiry).destroy();
      }
    }, void 0);
  void expiry.commit();
}
