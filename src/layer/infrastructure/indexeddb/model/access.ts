import {Observable, IObservableObserver, Set, Map, Timer} from 'arch-stream';
import {indexedDB} from '../module/global';
import {IDBEvent, IDBEventType} from './event';
import {supportWebStorage as status} from '../../webstorage/api';

const IDBEventObserver = new Observable<[string] | [string, IDBEventType], IDBEvent, void>();
export const event: IObservableObserver<[string] | [string, IDBEventType], IDBEvent, void> = IDBEventObserver;

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

const StateSet = new Set<string, States.type>((o, n) => {
  switch (o.constructor) {
    case States.Initial:
      switch (n.constructor) {
        case States.Block:
        case States.Upgrade:
        case States.Success:
        case States.Error:
        case States.Abort:
        case States.Crash:
          return n;
      }
      break;
    case States.Block:
      switch (n.constructor) {
        case States.Upgrade:
        case States.Success:
        case States.Error:
        case States.Abort:
          return n;
      }
      break;
    case States.Upgrade:
      switch (n.constructor) {
        case States.Success:
        case States.Error:
        case States.Abort:
        case States.Crash:
        case States.Destroy:
        case States.End:
          return n;
      }
      break;
    case States.Success:
      switch (n.constructor) {
        case States.Error:
        case States.Abort:
        case States.Crash:
        case States.Destroy:
        case States.End:
          return n;
      }
      break;
    case States.Error:
      switch (n.constructor) {
        case States.Destroy:
        case States.End:
          return n;
      }
      break;
    case States.Abort:
      switch (n.constructor) {
        case States.Destroy:
        case States.End:
          return n;
      }
      break;
    case States.Crash:
      switch (n.constructor) {
        case States.Destroy:
        case States.End:
          return n;
      }
      break;
    case States.Destroy:
      switch (n.constructor) {
        case States.Error:
        case States.End:
          return n;
      }
      break;
    case States.End:
      switch (n.constructor) {
        case States.Initial:
          return n;
      }
      break;
  }
  throw new Error(`LocalSocket: Invalid mutation: ${o.constructor.toString().match(/\w+/g)[1]} to ${n.constructor.toString().match(/\w+/g)[1]}`);
});
namespace States {
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
  export class Initial {
    private STATE: this;
    constructor(
      public database: string
    ) {
      void StateSet.add(database, this);
    }
  }
  export class Block {
    private STATE: this;
    constructor(
      public database: string
    ) {
      void StateSet.add(database, this);
    }
  }
  export class Upgrade {
    private STATE: this;
    constructor(
      public database: string,
      public session: IDBOpenDBRequest
    ) {
      void StateSet.add(database, this);
    }
  }
  export class Success {
    private STATE: this;
    constructor(
      public database: string,
      public connection: IDBDatabase
    ) {
      void StateSet.add(database, this);
    }
    public drain: () => void;
    public destroy: () => void;
    public end: () => void;
  }
  export class Error {
    private STATE: this;
    constructor(
      public database: string,
      public error: DOMError,
      public event: Event
    ) {
      void StateSet.add(database, this);
    }
  }
  export class Abort {
    private STATE: this;
    constructor(
      public database: string,
      public error: DOMError,
      public event: Event
    ) {
      void StateSet.add(database, this);
    }
  }
  export class Crash {
    private STATE: this;
    constructor(
      public database: string,
      public error: DOMError
    ) {
      void StateSet.add(database, this);
    }
  }
  export class Destroy {
    private STATE: this;
    constructor(
      public database: string
    ) {
      void StateSet.add(database, this);
    }
  }
  export class End {
    private STATE: this;
    constructor(
      public database: string
    ) {
      void StateSet.add(database, this);
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
  if (StateSet.has(name)) return;
  void handleFromInitialState(new States.Initial(name));
}
export function listen(name: string): Access {
  return (req: Request) => {
    const queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
    void queue.push(req);
    const state = StateSet.get(name);
    if (state instanceof States.Success) {
      void state.drain();
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
  if (StateSet.get(name) instanceof States.Success) return (<States.Success>StateSet.get(name)).end();
  if (StateSet.has(name)) return;
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
  if (StateSet.get(name) instanceof States.Success) return (<States.Success>StateSet.get(name)).destroy();
  if (StateSet.has(name)) return;
  void handleFromInitialState(new States.Initial(name));
}

function handleFromInitialState({database}: States.Initial, version: number = 0): void {
  assert(version >= 0);
  const config = ConfigMap.get(database);
  assert(config);
  try {
    const openRequest = version
      ? indexedDB.open(database, version)
      : indexedDB.open(database);

    const clear = () => {
      openRequest.onupgradeneeded = void 0;
      openRequest.onsuccess = void 0;
      openRequest.onerror = void 0;
    };
    openRequest.onblocked = _ =>
      void handleFromBlockedState(new States.Block(database));
    openRequest.onupgradeneeded = event => {
      void clear();
      void handleFromUpgradeState(new States.Upgrade(database, openRequest));
    };
    openRequest.onsuccess = _ => {
      void clear();
      void handleFromSuccessState(new States.Success(database, <IDBDatabase>openRequest.result));
    };
    openRequest.onerror = event => {
      void clear();
      void handleFromErrorState(new States.Error(database, openRequest.error, event));
    };
  }
  catch (err) {
    void handleFromCrashState(new States.Crash(database, err));
  }
  return;

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

  function handleFromSuccessState(state: States.Success): void {
    const {database, connection} = state;
    const clear = () => {
      connection.onversionchange = () => void connection.close();
      connection.onerror = void 0;
      connection.onabort = void 0;
    };
    connection.onversionchange = ({newVersion}) => {
      void clear();
      void connection.close();
      if (!newVersion) {
        void RequestQueueSet.delete(database);
        void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database));
      }
      void handleFromEndState(new States.End(database));
    };
    connection.onerror = event => {
      void clear();
      void handleFromErrorState(new States.Error(database, (<any>event.target).error, event));
    };
    connection.onabort = event => {
      void clear();
      void handleFromAbortState(new States.Abort(database, (<any>event.target).error, event));
    };
    state.destroy = () => {
      void clear();
      void connection.close();
      void handleFromDestroyState(new States.Destroy(database));
    };
    state.end = () => {
      void clear();
      void connection.close();
      void handleFromEndState(new States.End(database));
    };
    state.drain = () => {
      const reqs = RequestQueueSet.get(database) || [];
      try {
        while (reqs.length > 0 && CommandMap.get(database) === CommandType.open) {
          void reqs[0](connection);
          void reqs.shift();
        }
      }
      catch (err) {
        void console.error(err);
        void handleFromCrashState(new States.Crash(database, err));
      }
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
        return void state.drain();
      }
      case CommandType.close: {
        return void state.end();
      }
      case CommandType.destroy: {
        return void state.destroy();
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
    void StateSet.delete(database);
    switch (CommandMap.get(database)) {
      case CommandType.open: {
        return void handleFromInitialState(new States.Initial(database), version);
      }
      case CommandType.close: {
        void CommandMap.delete(database);
        void ConfigMap.delete(database);
        return void IDBEventObserver.emit([database, IDBEventType.disconnect], new IDBEvent(IDBEventType.disconnect, database));
      }
      case CommandType.destroy: {
        void CommandMap.delete(database);
        void ConfigMap.delete(database);
        return void IDBEventObserver.emit([database, IDBEventType.disconnect], new IDBEvent(IDBEventType.disconnect, database));
      }
    }
    throw new TypeError(`LocalSocket: Invalid command ${CommandMap.get(database)}.`);
  }
}
