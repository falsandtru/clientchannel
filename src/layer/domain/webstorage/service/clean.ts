import {repository} from '../repository/store';
import {WebStorageMetaData} from './meta';

export function clean(meta: WebStorageMetaData, storage: Storage, now = Date.now()): void {
  if (!storage) return;

  void meta.entries()
    .reduce((_, [name, {expire}]) => {
      if (expire.atime + 1000 * 3600 * 24 > now) {
        expire.rest = expire.life;
      }
      else {
        expire.atime = now;
        void --expire.rest;
      }
      if (expire.rest < 0) {
        void repository(name, storage, () => ({}), 0, meta).destroy();
      }
    }, void 0);
  void meta.commit();
}
