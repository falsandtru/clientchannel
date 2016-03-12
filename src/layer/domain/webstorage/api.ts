import {repository} from './repository/port';
import {expiry} from './service/expiry';
import {clean} from './service/clean';
import {localStorage} from '../../infrastructure/webstorage/api';

export {localStorage, sessionStorage} from '../../infrastructure/webstorage/api';
export {events} from './service/event';
export function webstorage<T>(name: string, storage: Storage, factory: () => T, life: number) {
  return repository(name, storage, factory, life, storage === localStorage ? expiry : void 0);
}

void clean(expiry, localStorage);
void setInterval((): void => void clean(expiry, localStorage), 1e3 * 3600);
