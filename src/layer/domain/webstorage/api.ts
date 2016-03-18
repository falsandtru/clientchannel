import {repository} from './repository/port';
import {log} from './service/log';
import {expiry} from './service/expiry';
import {localStorage, supportWebStorage} from '../../infrastructure/webstorage/api';

export {localStorage, sessionStorage, supportWebStorage} from '../../infrastructure/webstorage/api';
export {events} from './service/event';
export function webstorage<T>(name: string, storage: Storage, factory: () => T, expiry_: number) {
  void expiry.add(name, expiry_);
  return repository(name, storage, factory, storage === localStorage ? log : void 0);
}
