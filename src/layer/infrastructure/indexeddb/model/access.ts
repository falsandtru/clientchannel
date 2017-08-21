import { configs, Config, commands, Command, requests } from './state';
import { handleState } from './mutation';

export function open(database: string, config: Config): void {
  void commands.set(database, Command.open);
  void configs.set(database, config);
  void handleState(database);
}

export function listen(database: string): (success: (db: IDBDatabase) => void, failure?: () => void) => void {
  return (success, failure = () => void 0) => (
    void requests.get(database)!.add(success, failure),
    void handleState(database));
}

export function close(database: string): void {
  void commands.set(database, Command.close);
  void configs.set(database, {
    make() {
      return false;
    },
    verify() {
      return false;
    },
    destroy() {
      return false;
    }
  });
  void handleState(database);
}

export function destroy(database: string): void {
  void commands.set(database, Command.destroy);
  void configs.set(database, {
    make() {
      return false;
    },
    verify() {
      return false;
    },
    destroy() {
      return true;
    }
  });
  void handleState(database);
}
