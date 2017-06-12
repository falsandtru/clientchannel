import { configs, Config, commands, Command, requests, Request } from './state';
import { handleState } from './mutation';

export function open(database: string, config: Config): void {
  void commands.set(database, Command.open);
  void configs.set(database, config);
  void handleState(database);
}

export function listen(database: string): (req: Request) => void {
  return (req: Request) => {
    void requests.set(database, requests.get(database) || []).get(database)!.push(req);
    void handleState(database);
  };
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
