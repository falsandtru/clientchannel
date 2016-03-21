import {Observable, IObservableObserver, Set, Map, Timer} from 'arch-stream';
import {indexedDB} from '../module/global';
import {IDBEvent, IDBEventType} from './event';
import {supportWebStorage as status} from '../../webstorage/api';

const IDBEventObserver = new Observable<[string] | [string, string], IDBEvent, void>();
export const event: IObservableObserver<[string] | [string, string], IDBEvent, void> = IDBEventObserver;

export const ConfigMap = new Map<string, Config>();
export type Config = {
  make: (db: IDBDatabase) => boolean;
  verify: (db: IDBDatabase) => boolean;
  destroy: (error: DOMError, event: Event) => boolean;
};

const CommandMap = new Map<string, CommandType>();
const enum CommandType {
  open,
  close,
  destroy
}

const StateMap = new Map<string, States.type>();
namespace States {
  abstract class State {
    private ABS: this;
  }
  export type type
    = Initial
    | Block
    | Upgrade
    | Success
    | Error
    | Abort
    | Crash
    | Destroy
    | End;
  export class Initial extends State {
    private STATE: this;
    constructor(
      public database: string
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Block extends State {
    private STATE: this;
    constructor(
      public database: string
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Upgrade extends State {
    private STATE: this;
    constructor(
      public database: string,
      public session: IDBOpenDBRequest
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Success extends State {
    private STATE: this;
    constructor(
      public database: string,
      public connection: IDBDatabase
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Error extends State {
    private STATE: this;
    constructor(
      public database: string,
      public error: DOMError,
      public event: Event
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Abort extends State {
    private STATE: this;
    constructor(
      public database: string,
      public error: DOMError,
      public event: Event
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Crash extends State {
    private STATE: this;
    constructor(
      public database: string,
      public error: DOMError
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class Destroy extends State {
    private STATE: this;
    constructor(
      public database: string
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
  export class End extends State {
    private STATE: this;
    constructor(
      public database: string
    ) {
      super();
      void StateMap.set(database, this);
    }
  }
}

type Request = (db: IDBDatabase) => any;
const RequestQueueSet = new Set<string, Request[]>();

export type Access = (req: Request) => any;

export function open(name: string, config: Config): void {
  assert(config);
  void CommandMap.set(name, CommandType.open);
  void ConfigMap.set(name, config);
  if (StateMap.has(name)) return;
  void handleFromInitialState(new States.Initial(name));
}
export function listen(name: string): Access {
  return (req: Request) => {
    const queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
    void queue.push(req);
    const state = StateMap.get(name);
    if (state instanceof States.Success) {
      void drain(state.database, state.connection);
    }
  };
}
export function close(name: string): void {
  void CommandMap.set(name, CommandType.close);
  void ConfigMap.set(name, {
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
  if (StateMap.get(name) instanceof States.Success) return (<States.Success>StateMap.get(name)).connection.end();
  if (StateMap.has(name)) return;
  void handleFromInitialState(new States.Initial(name));
}
export function destroy(name: string): void {
  void CommandMap.set(name, CommandType.destroy);
  void ConfigMap.set(name, {
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
  if (StateMap.get(name) instanceof States.Success) return (<States.Success>StateMap.get(name)).connection.destroy();
  if (StateMap.has(name)) return;
  void handleFromInitialState(new States.Initial(name));
}

function drain(name: string, connection: IDBDatabase): void {
  if (!status) return void RequestQueueSet.delete(name);
  if (CommandMap.get(name) !== CommandType.open) return;
  assert(ConfigMap.has(name));
  if (!StateMap.has(name)) return void open(name, ConfigMap.get(name));
  const reqs = RequestQueueSet.get(name) || [];
  try {
    while (reqs.length > 0 && CommandMap.get(name) === CommandType.open) {
      void reqs[0](connection);
      void reqs.shift();
    }
  }
  catch (err) {
    void console.error(err);
    void handleFromCrashState(new States.Crash(name, err));
  }
}

function handleFromInitialState({database}: States.Initial, version: number = 0): void {
  assert(version >= 0);
  const config = ConfigMap.get(database);
  assert(config);
  try {
    const openRequest = version
      ? indexedDB.open(database, version)
      : indexedDB.open(database);

    openRequest.onupgradeneeded = event =>
      void handleFromUpgradeState(new States.Upgrade(database, openRequest));
    openRequest.onsuccess = _ =>
      void handleFromSuccessState(new States.Success(database, <IDBDatabase>openRequest.result));
    openRequest.onblocked = _ =>
      void handleFromBlockedState(new States.Block(database));
    openRequest.onerror = event =>
      void handleFromErrorState(new States.Error(database, openRequest.error, event));
  }
  catch (err) {
    void handleFromCrashState(new States.Crash(database, err));
  }
}

function handleFromBlockedState({database}: States.Block): void {
  void IDBEventObserver.emit([database, IDBEventType.block], new IDBEvent(IDBEventType.block, database));
}

function handleFromUpgradeState({database, session}: States.Upgrade): void {
  const db: IDBDatabase = session.transaction.db;
  assert(db);
  const {make, destroy} = ConfigMap.get(database);
  try {
    if (make(db)) {
      session.onsuccess = _ =>
        void handleFromSuccessState(new States.Success(database, db));
      session.onerror = event =>
        void handleFromErrorState(new States.Error(database, session.error, event));
    }
    else {
      session.onsuccess = session.onerror = event => {
        void db.close();
        destroy(session.error, event)
          ? void handleFromDestroyState(new States.Destroy(database))
          : void handleFromEndState(new States.End(database));
      }
    }
  }
  catch (err) {
    void handleFromCrashState(new States.Crash(database, err));
  }
}

function handleFromSuccessState({database, connection}: States.Success): void {
  connection.end = () => {
    void connection.close();
    void handleFromEndState(new States.End(database));
  };
  connection.destroy = () => {
    void connection.close();
    void handleFromDestroyState(new States.Destroy(database));
  };
  connection.onversionchange = () => {
    void connection.close();
    void handleFromEndState(new States.End(database));
  };
  connection.onerror = event => {
    void handleFromErrorState(new States.Error(database, (<any>event.target).error, event));
  };
  connection.onabort = event => {
    void handleFromAbortState(new States.Abort(database, (<any>event.target).error, event));
  };

  switch (CommandMap.get(database)) {
    case CommandType.open: {
      const {verify} = ConfigMap.get(database);
      try {
        if (!verify(connection)) return void handleFromEndState(new States.End(database), connection.version + 1);
      }
      catch (err) {
        return void handleFromCrashState(new States.Crash(database, err));
      }
      void IDBEventObserver.emit([database, IDBEventType.connect], new IDBEvent(IDBEventType.connect, database));
      return void drain(database, connection);
    }
    case CommandType.close: {
      return void connection.end();
    }
    case CommandType.destroy: {
      return void connection.destroy();
    }
  }
  throw new TypeError(`LocalSocket: Invalid command ${CommandMap.get(database)}.`);
}

function handleFromErrorState({database, error, event}: States.Error): void {
  void event.preventDefault();
  void IDBEventObserver.emit([database, IDBEventType.error], new IDBEvent(IDBEventType.error, database));
  const {destroy} = ConfigMap.get(database);
  if (destroy(error, event)) {
    return void handleFromDestroyState(new States.Destroy(database));
  }
  else {
    return void handleFromEndState(new States.End(database));
  }
}

function handleFromAbortState({database, error, event}: States.Abort): void {
  void event.preventDefault();
  void IDBEventObserver.emit([database, IDBEventType.abort], new IDBEvent(IDBEventType.abort, database));
  const {destroy} = ConfigMap.get(database);
  if (destroy(error, event)) {
    return void handleFromDestroyState(new States.Destroy(database));
  }
  else {
    return void handleFromEndState(new States.End(database));
  }
}

function handleFromCrashState({database, error}: States.Crash): void {
  void IDBEventObserver.emit([database, IDBEventType.crash], new IDBEvent(IDBEventType.crash, database));
  const {destroy} = ConfigMap.get(database);
  if (destroy(error, null)) {
    return void handleFromDestroyState(new States.Destroy(database));
  }
  else {
    return void handleFromEndState(new States.End(database));
  }
}

function handleFromDestroyState({database}: States.Destroy): void {
  const deleteRequest = indexedDB.deleteDatabase(database);
  deleteRequest.onsuccess = _ => {
    void RequestQueueSet.delete(database);
    void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database));
    void handleFromEndState(new States.End(database));
  };
  deleteRequest.onerror = event => {
    void handleFromErrorState(new States.Error(database, deleteRequest.error, event));
  };
}

function handleFromEndState({database}: States.End, version = 0): void {
  void StateMap.delete(database);
  switch (CommandMap.get(database)) {
    case CommandType.open: {
      return void handleFromInitialState(new States.Initial(database), version);
    }
    case CommandType.close: {
      void ConfigMap.delete(database);
      return void IDBEventObserver.emit([database, IDBEventType.disconnect], new IDBEvent(IDBEventType.disconnect, database));
    }
    case CommandType.destroy: {
      void ConfigMap.delete(database);
      return void IDBEventObserver.emit([database, IDBEventType.disconnect], new IDBEvent(IDBEventType.disconnect, database));
    }
  }
  throw new TypeError(`LocalSocket: Invalid command ${CommandMap.get(database)}.`);
}
