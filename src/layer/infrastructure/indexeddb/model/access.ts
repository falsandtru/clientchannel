import { Observation, Observer } from 'spica';
import { indexedDB } from '../module/global';
import { IDBEvent, IDBEventType } from './event';

const IDBEventObserver = new Observation<[string] | [string, IDBEventType], IDBEvent, void>();
export const event: Observer<[string] | [string, IDBEventType], IDBEvent, void> = IDBEventObserver;

const configs = new Map<string, Config>();
export type Config = {
  make: (db: IDBDatabase) => boolean;
  verify: (db: IDBDatabase) => boolean;
  destroy: (error: DOMException | DOMError, event: Event | null) => boolean;
};

const commands = new Map<string, Command>();
const enum Command {
  open,
  close,
  destroy
}

const states = new Map<string, State>();
type State
  = State.Initial
  | State.Block
  | State.Upgrade
  | State.Success
  | State.Error
  | State.Abort
  | State.Crash
  | State.Destroy
  | State.End;
namespace State {
  export class Initial {
    private readonly STATE: this;
    constructor(
      public readonly database: string
    ) {
      this.STATE;
      assert(!states.has(database));
      void states.set(database, this);
    }
  }
  export class Block {
    private readonly STATE: this;
    constructor(
      public readonly database: string
    ) {
      this.STATE;
      assert([Initial].some(S => states.get(database) instanceof S));
      void states.set(database, this);
    }
  }
  export class Upgrade {
    private readonly STATE: this;
    constructor(
      public readonly database: string,
      public readonly session: IDBOpenDBRequest
    ) {
      this.STATE;
      assert([Initial, Block].some(S => states.get(database) instanceof S));
      void states.set(database, this);
    }
  }
  export class Success {
    private readonly STATE: this;
    constructor(
      public readonly database: string,
      public readonly connection: IDBDatabase
    ) {
      this.STATE;
      assert([Initial, Upgrade, Block].some(S => states.get(database) instanceof S));
      void states.set(database, this);
    }
    public drain: () => void;
    public destroy: () => void;
    public end: () => void;
  }
  export class Error {
    private readonly STATE: this;
    constructor(
      public readonly database: string,
      public readonly error: DOMException | DOMError,
      public readonly event: Event
    ) {
      this.STATE;
      assert(states.has(database));
      void states.set(database, this);
    }
  }
  export class Abort {
    private readonly STATE: this;
    constructor(
      public readonly database: string,
      public readonly error: DOMException | DOMError,
      public readonly event: Event
    ) {
      this.STATE;
      assert(states.has(database));
      void states.set(database, this);
    }
  }
  export class Crash {
    private readonly STATE: this;
    constructor(
      public readonly database: string,
      public readonly error: DOMException | DOMError
    ) {
      this.STATE;
      assert(states.has(database));
      void states.set(database, this);
    }
  }
  export class Destroy {
    private readonly STATE: this;
    constructor(
      public readonly database: string
    ) {
      this.STATE;
      assert(states.has(database));
      void states.set(database, this);
    }
  }
  export class End {
    private readonly STATE: this;
    constructor(
      public readonly database: string
    ) {
      this.STATE;
      assert(states.has(database));
      void states.set(database, this);
    }
  }
}

const requests = new Map<string, Request[]>();
type Request = (db: IDBDatabase) => void;

export function open(name: string, config: Config): void {
  assert(config);
  void commands.set(name, Command.open);
  void configs.set(name, config);
  if (states.has(name)) return;
  void handleFromInitialState(new State.Initial(name));
}
export function listen(name: string): (req: Request) => void {
  return (req: Request) => {
    const queue = requests.get(name) || requests.set(name, []).get(name)!;
    void queue.push(req);
    if (!states.has(name)) return;
    const state = states.get(name);
    if (state instanceof State.Success) {
      void state.drain();
    }
  };
}
export function close(name: string): void {
  void commands.set(name, Command.close);
  void configs.set(name, {
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
  if (!states.has(name)) return void handleFromInitialState(new State.Initial(name));
  const state = states.get(name);
  if (state instanceof State.Success) {
    state.end();
  }
}
export function destroy(name: string): void {
  void commands.set(name, Command.destroy);
  void configs.set(name, {
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
  if (!states.has(name)) return void handleFromInitialState(new State.Initial(name));
  const state = states.get(name);
  if (state instanceof State.Success) {
    state.destroy();
  }
}

function handleFromInitialState({database}: State.Initial, version: number = 0): void {
  assert(version >= 0);
  const config = configs.get(database);
  assert(config);
  try {
    const openRequest = version
      ? indexedDB.open(database, version)
      : indexedDB.open(database);

    const clear = () => (
      openRequest.onupgradeneeded = <any>void 0,
      openRequest.onsuccess = <any>void 0,
      openRequest.onerror = <any>void 0)
    openRequest.onblocked = () => (
      void handleFromBlockedState(new State.Block(database)));
    openRequest.onupgradeneeded = () => (
      void clear(),
      void handleFromUpgradeState(new State.Upgrade(database, openRequest)));
    openRequest.onsuccess = () => (
      void clear(),
      void handleFromSuccessState(new State.Success(database, <IDBDatabase>openRequest.result)));
    openRequest.onerror = event => (
      void clear(),
      void handleFromErrorState(new State.Error(database, openRequest.error, event)));
  }
  catch (err) {
    void handleFromCrashState(new State.Crash(database, err));
  }
  return;

  function handleFromBlockedState({database}: State.Block): void {
    void IDBEventObserver.emit([database, IDBEventType.block], new IDBEvent(IDBEventType.block, database));
  }

  function handleFromUpgradeState({database, session}: State.Upgrade): void {
    const db: IDBDatabase = session.transaction.db;
    assert(db);
    const {make, destroy} = configs.get(database)!;
    try {
      if (make(db)) {
        session.onsuccess = () =>
          void handleFromSuccessState(new State.Success(database, db));
        session.onerror = event =>
          void handleFromErrorState(new State.Error(database, session.error, event));
      }
      else {
        session.onsuccess = session.onerror = event => (
          void db.close(),
          destroy(session.error, event)
            ? void handleFromDestroyState(new State.Destroy(database))
            : void handleFromEndState(new State.End(database)));
      }
    }
    catch (err) {
      void handleFromCrashState(new State.Crash(database, err));
    }
  }

  function handleFromSuccessState(state: State.Success): void {
    const {database, connection} = state;
    const clear = () => (
      connection.onversionchange = () => void connection.close(),
      connection.onerror = <any>void 0,
      connection.onabort = <any>void 0,
      connection.onclose = <any>void 0)
    connection.onversionchange = ({newVersion}) => {
      void clear();
      void connection.close();
      if (!newVersion) {
        void requests.delete(database);
        void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database));
      }
      if (states.get(database) !== state) return;
      void handleFromEndState(new State.End(database));
    };
    connection.onerror = event => (
      void clear(),
      void handleFromErrorState(new State.Error(database, (<any>event.target).error, event)));
    connection.onabort = event => (
      void clear(),
      void handleFromAbortState(new State.Abort(database, (<any>event.target).error, event)));
    connection.onclose = () => (
      void clear(),
      void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database)),
      void handleFromEndState(new State.End(database)));
    state.destroy = () => (
      void clear(),
      void connection.close(),
      void handleFromDestroyState(new State.Destroy(database)));
    state.end = () => (
      void clear(),
      void connection.close(),
      void handleFromEndState(new State.End(database)));
    state.drain = () => {
      const reqs = requests.get(database) || [];
      try {
        while (reqs.length > 0 && commands.get(database) === Command.open) {
          void reqs[0](connection);
          void reqs.shift();
        }
      }
      catch (err) {
        assert(!console.debug(err + ''));
        void new Promise((_, reject) =>
          void reject(err));
        void clear();
        void handleFromCrashState(new State.Crash(database, err));
      }
    };


    switch (commands.get(database)) {
      case Command.open: {
        const {verify} = configs.get(database)!;
        try {
          if (!verify(connection)) return void handleFromEndState(new State.End(database), connection.version + 1);
        }
        catch (err) {
          return void handleFromCrashState(new State.Crash(database, err));
        }
        void IDBEventObserver.emit([database, IDBEventType.connect], new IDBEvent(IDBEventType.connect, database));
        return void state.drain();
      }
      case Command.close:
        return void state.end();
      case Command.destroy:
        return void state.destroy();
    }
    throw new TypeError(`ClientChannel: Invalid command ${commands.get(database)}.`);
  }

  function handleFromErrorState({database, error, event}: State.Error): void {
    void event.preventDefault();
    void IDBEventObserver.emit([database, IDBEventType.error], new IDBEvent(IDBEventType.error, database));
    const {destroy} = configs.get(database)!;
    if (destroy(error, event)) {
      return void handleFromDestroyState(new State.Destroy(database));
    }
    else {
      return void handleFromEndState(new State.End(database));
    }
  }

  function handleFromAbortState({database, error, event}: State.Abort): void {
    void event.preventDefault();
    void IDBEventObserver.emit([database, IDBEventType.abort], new IDBEvent(IDBEventType.abort, database));
    const {destroy} = configs.get(database)!;
    if (destroy(error, event)) {
      return void handleFromDestroyState(new State.Destroy(database));
    }
    else {
      return void handleFromEndState(new State.End(database));
    }
  }

  function handleFromCrashState({database, error}: State.Crash): void {
    void IDBEventObserver.emit([database, IDBEventType.crash], new IDBEvent(IDBEventType.crash, database));
    const {destroy} = configs.get(database)!;
    if (destroy(error, null)) {
      return void handleFromDestroyState(new State.Destroy(database));
    }
    else {
      return void handleFromEndState(new State.End(database));
    }
  }

  function handleFromDestroyState({database}: State.Destroy): void {
    const deleteRequest = indexedDB.deleteDatabase(database);
    deleteRequest.onsuccess = () => (
      void requests.delete(database),
      void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database)),
      void handleFromEndState(new State.End(database)));
    deleteRequest.onerror = event => (
      void handleFromErrorState(new State.Error(database, deleteRequest.error, event)));
  }

  function handleFromEndState({database}: State.End, version = 0): void {
    void states.delete(database);
    switch (commands.get(database)) {
      case Command.open:
        return (
          void handleFromInitialState(new State.Initial(database), version));
      case Command.close:
        return (
          void commands.delete(database),
          void configs.delete(database),
          void IDBEventObserver.emit([database, IDBEventType.disconnect], new IDBEvent(IDBEventType.disconnect, database)));
      case Command.destroy:
        return (
          void commands.delete(database),
          void configs.delete(database),
          void IDBEventObserver.emit([database, IDBEventType.disconnect], new IDBEvent(IDBEventType.disconnect, database)));
    }
    throw new TypeError(`ClientChannel: Invalid command ${commands.get(database)}.`);
  }
}
