import {repository} from './repository/port';
import {localStorage, supportWebStorage} from '../../infrastructure/webstorage/api';

export {localStorage, sessionStorage, supportWebStorage} from '../../infrastructure/webstorage/api';
export {events} from './service/event';
export {PortEvent as WebStorageEvent, PortEventType as WebStorageEventType} from './repository/port';
export function webstorage<T>(name: string, storage: Storage, factory: () => T) {
  return repository(name, storage, factory);
}
