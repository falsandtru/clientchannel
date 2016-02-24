import {LocalSocket, LocalStore, LocalSocketObject, LocalSocketConfig} from 'localsocket';
import {socket, store} from '../app/api';

export function localsocket<T extends LocalSocketObject>(name: string, storage: IDBFactory | Storage = indexedDB, config = <LocalSocketConfig<T>>{}): LocalSocket<T> | LocalStore<T> {
  return storage === indexedDB
    ? socket(name, config)
    : store(name, <Storage>storage, config);
}
export {events} from '../app/api';
