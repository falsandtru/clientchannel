import { isIDBAvailable, states, commands, configs, requests, Command, Config } from './state';
import { handle } from './transition';
import { idbEventStream, IDBEventType } from './event';
import { isStorageAvailable } from '../../environment/api';
import { noop } from 'spica/noop';

export type Listen = (success: (db: IDBDatabase) => void, failure?: (reason: unknown) => void) => void;

export function open(database: string, config: Config): Listen {
  void operate(database, Command.open, config);
  return (success: (db: IDBDatabase) => void, failure?: (reason: unknown) => void) =>
    void request(database, success, failure);
}

export const listen_ = request;

export function close(database: string): void {
  return void operate(database, Command.close, {
    make() {
      return false;
    },
    verify() {
      return false;
    },
    destroy() {
      return false;
    },
  });
}

export function destroy(database: string): void {
  return void operate(database, Command.destroy, {
    make() {
      return false;
    },
    verify() {
      return false;
    },
    destroy() {
      return true;
    },
  });
}

function operate(database: string, command: Command, config: Config): void {
  if (commands.get(database) === Command.destroy) {
    assert(states.has(database));
    switch (command) {
      case Command.open:
      case Command.close:
        return void idbEventStream
          .once([database, IDBEventType.destroy], () =>
            void operate(database, command, config));
    }
  }
  void commands.set(database, command);
  void configs.set(database, config);
  if (!isIDBAvailable || !isStorageAvailable) return;
  if (states.has(database)) {
    assert(requests.has(database));
    return void request(database, noop);
  }
  else {
    assert(commands.get(database) === command);
    assert(configs.get(database) === config);
    return void handle(database);
  }
}

function request(database: string, success: (db: IDBDatabase) => void, failure: (reason: unknown) => void = noop): void {
  if (!isIDBAvailable) return void failure(new Error('Database is unavailable.'));
  if (!isStorageAvailable) return void failure(new Error('Storage is unavailable.'));
  if (!requests.has(database)) return void failure(new Error('Database is inactive.'));
  void requests.get(database)!.enqueue(success, failure);
  void handle(database);
}
