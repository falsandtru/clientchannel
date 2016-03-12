import {repository} from './repository/port';
import {meta} from './service/meta';
import {clean} from './service/clean';
import {localStorage} from '../../infrastructure/webstorage/api';

export {localStorage, sessionStorage} from '../../infrastructure/webstorage/api';
export {events} from './service/event';
export function webstorage<T>(name: string, storage: Storage, factory: () => T, life: number) {
  return repository(name, storage, factory, life, storage === localStorage ? meta : void 0);
}

void clean(meta, localStorage);
void setInterval((): void => void clean(meta, localStorage), 1e3 * 3600);
