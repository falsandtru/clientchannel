import {Observable, IObservableObserver, Set, Map} from 'arch-stream';
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

const StateSet = new Set<string, State.Type>((o, n) => {
  switch (o.constructor) {
    case State.Initial:
      switch (n.constructor) {
        case State.Block:
        case State.Upgrade:
        case State.Success:
        case State.Error:
        case State.Abort:
        case State.Crash:
          return n;
      }
      break;
    case State.Block:
      switch (n.constructor) {
        case State.Upgrade:
        case State.Success:
        case State.Error:
        case State.Abort:
          return n;
      }
      break;
    case State.Upgrade:
      switch (n.constructor) {
        case State.Success:
        case State.Error:
        case State.Abort:
        case State.Crash:
        case State.Destroy:
        case State.End:
          return n;
      }
      break;
    case State.Success:
      switch (n.constructor) {
        case State.Error:
        case State.Abort:
        case State.Crash:
        case State.Destroy:
        case State.End:
          return n;
      }
      break;
    case State.Error:
      switch (n.constructor) {
        case State.Destroy:
        case State.End:
          return n;
      }
      break;
    case State.Abort:
      switch (n.constructor) {
        case State.Destroy:
        case State.End:
          return n;
      }
      break;
    case State.Crash:
      switch (n.constructor) {
        case State.Destroy:
        case State.End:
          return n;
      }
      break;
    case State.Destroy:
      switch (n.constructor) {
        case State.Error:
        case State.End:
          return n;
      }
      break;
    case State.End:
      switch (n.constructor) {
        case State.Initial:
          return n;
      }
      break;
  }
  throw new Error(`LocalSocket: Invalid mutation: ${o.constructor.toString().match(/\w+/g)[1]} to ${n.constructor.toString().match(/\w+/g)[1]}`);
});
namespace State {
  export type Type
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

export function open(name: string, config: Config): void {
  assert(config);
  void CommandMap.set(name, CommandType.open);
  void ConfigMap.set(name, config);
  if (StateSet.has(name)) return;
  void handleFromInitialState(new State.Initial(name));
}
export function listen(name: string): (req: Request) => any {
  return (req: Request) => {
    const queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
    void queue.push(req);
    const state = StateSet.get(name);
    if (state instanceof State.Success) {
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
  if (StateSet.get(name) instanceof State.Success) return (<State.Success>StateSet.get(name)).end();
  if (StateSet.has(name)) return;
  void handleFromInitialState(new State.Initial(name));
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
  if (StateSet.get(name) instanceof State.Success) return (<State.Success>StateSet.get(name)).destroy();
  if (StateSet.has(name)) return;
  void handleFromInitialState(new State.Initial(name));
}

function handleFromInitialState({database}: State.Initial, version: number = 0): void {
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
      void handleFromBlockedState(new State.Block(database));
    openRequest.onupgradeneeded = event => {
      void clear();
      void handleFromUpgradeState(new State.Upgrade(database, openRequest));
    };
    openRequest.onsuccess = _ => {
      void clear();
      void handleFromSuccessState(new State.Success(database, <IDBDatabase>openRequest.result));
    };
    openRequest.onerror = event => {
      void clear();
      void handleFromErrorState(new State.Error(database, openRequest.error, event));
    };
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
    const {make, destroy} = ConfigMap.get(database);
    try {
      if (make(db)) {
        session.onsuccess = _ =>
          void handleFromSuccessState(new State.Success(database, db));
        session.onerror = event =>
          void handleFromErrorState(new State.Error(database, session.error, event));
      }
      else {
        session.onsuccess = session.onerror = event => {
          void db.close();
          destroy(session.error, event)
            ? void handleFromDestroyState(new State.Destroy(database))
            : void handleFromEndState(new State.End(database));
        }
      }
    }
    catch (err) {
      void handleFromCrashState(new State.Crash(database, err));
    }
  }

  function handleFromSuccessState(state: State.Success): void {
    const {database, connection} = state;
    const clear = () => {
      connection.onversionchange = () => void connection.close();
      connection.onerror = void 0;
      connection.onabort = void 0;
      connection.onclose = void 0;
    };
    connection.onversionchange = ({newVersion}) => {
      void clear();
      void connection.close();
      if (!newVersion) {
        void RequestQueueSet.delete(database);
        void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database));
      }
      if (StateSet.get(database) !== state) return;
      void handleFromEndState(new State.End(database));
    };
    connection.onerror = event => {
      void clear();
      void handleFromErrorState(new State.Error(database, (<any>event.target).error, event));
    };
    connection.onabort = event => {
      void clear();
      void handleFromAbortState(new State.Abort(database, (<any>event.target).error, event));
    };
    connection.onclose = event => {
      void clear();
      void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database));
      if (StateSet.get(database) !== state) return;
      void handleFromEndState(new State.End(database));
    };
    state.destroy = () => {
      void clear();
      void connection.close();
      void handleFromDestroyState(new State.Destroy(database));
    };
    state.end = () => {
      void clear();
      void connection.close();
      void handleFromEndState(new State.End(database));
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
        if (err instanceof DOMError || err instanceof DOMException) {
          void console.warn(err);
        }
        else {
          void console.error(err);
        }
        void clear();
        void handleFromCrashState(new State.Crash(database, err));
      }
    };


    switch (CommandMap.get(database)) {
      case CommandType.open: {
        const {verify} = ConfigMap.get(database);
        try {
          if (!verify(connection)) return void handleFromEndState(new State.End(database), connection.version + 1);
        }
        catch (err) {
          return void handleFromCrashState(new State.Crash(database, err));
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

  function handleFromErrorState({database, error, event}: State.Error): void {
    void event.preventDefault();
    void IDBEventObserver.emit([database, IDBEventType.error], new IDBEvent(IDBEventType.error, database));
    const {destroy} = ConfigMap.get(database);
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
    const {destroy} = ConfigMap.get(database);
    if (destroy(error, event)) {
      return void handleFromDestroyState(new State.Destroy(database));
    }
    else {
      return void handleFromEndState(new State.End(database));
    }
  }

  function handleFromCrashState({database, error}: State.Crash): void {
    void IDBEventObserver.emit([database, IDBEventType.crash], new IDBEvent(IDBEventType.crash, database));
    const {destroy} = ConfigMap.get(database);
    if (destroy(error, null)) {
      return void handleFromDestroyState(new State.Destroy(database));
    }
    else {
      return void handleFromEndState(new State.End(database));
    }
  }

  function handleFromDestroyState({database}: State.Destroy): void {
    const deleteRequest = indexedDB.deleteDatabase(database);
    deleteRequest.onsuccess = _ => {
      void RequestQueueSet.delete(database);
      void IDBEventObserver.emit([database, IDBEventType.destroy], new IDBEvent(IDBEventType.destroy, database));
      void handleFromEndState(new State.End(database));
    };
    deleteRequest.onerror = event => {
      void handleFromErrorState(new State.Error(database, deleteRequest.error, event));
    };
  }

  function handleFromEndState({database}: State.End, version = 0): void {
    void StateSet.delete(database);
    switch (CommandMap.get(database)) {
      case CommandType.open: {
        return void handleFromInitialState(new State.Initial(database), version);
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
