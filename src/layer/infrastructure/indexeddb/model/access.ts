import { Config, Command } from './state';
import { operate, request } from './mutation';

export type Listen = (success: (db: IDBDatabase) => void, failure?: () => void) => void;

export function open(database: string, config: Config): Listen {
  void operate(database, Command.open, config);
  return (success: (db: IDBDatabase) => void, failure?: () => void) =>
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
