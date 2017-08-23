import { Config, Command } from './state';
import { operate, request } from './mutation';

export function open(database: string, config: Config): void {
  return void operate(database, Command.open, config);
}

export function listen(database: string): (success: (db: IDBDatabase) => void, failure?: () => void) => void {
  return (success, failure = () => void 0) =>
    void request(database, success, failure);
}

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
