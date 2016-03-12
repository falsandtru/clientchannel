import {Observable, IObservableObserver, Set, Map, Timer} from 'arch-stream';
import {indexedDB} from '../module/global';
import {IDBEvent, IDBEvenType} from './event';

const IDBEventObserver = new Observable<string, IDBEvent, void>();
export const event: IObservableObserver<string, IDBEvent, void> = IDBEventObserver;

export type Config = {
  make: (db: IDBDatabase) => boolean;
  verify: (db: IDBDatabase) => boolean;
  destroy: (error: DOMError, event: Event) => boolean;
};
export const ConfigMap = new Map<string, Config>();

const enum StateCommand {
  open,
  close,
  destroy
}
const StateCommandMap = new Map<string, StateCommand>();

export type Access = (req: Request) => any;
type Request = (db: IDBDatabase) => any;
const RequestQueueSet = new Set<string, Request[]>();

const StateSet = new Set<string, boolean>();
const ConnectionSet = new Set<string, IDBDatabase>();

export function open(name: string, config: Config): Access {
  void StateCommandMap.set(name, StateCommand.open);
  void ConfigMap.set(name, config);
  if (!StateSet.get(name)) {
    void StateSet.add(name, true);
    void handleFromInitialState(name);
  }
  return (req: Request) => {
    const queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
    void queue.push(req);
    void drain(name);
  };
}
export function listen(name: string): Access {
  return (req: Request) => {
    const queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
    void queue.push(req);
    void drain(name);
  };
}
export function close(name: string): void {
  void StateCommandMap.set(name, StateCommand.close);
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
  if (ConnectionSet.get(name)) {
    return ConnectionSet.get(name).end();
  }
  if (!StateSet.get(name)) {
    void StateSet.add(name, true);
    void handleFromInitialState(name);
  }
}
export function destroy(name: string): void {
  void StateCommandMap.set(name, StateCommand.destroy);
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
  if (ConnectionSet.get(name)) {
    return ConnectionSet.get(name).destroy();
  }
  if (!StateSet.get(name)) {
    void StateSet.add(name, true);
    void handleFromInitialState(name);
  }
}

function drain(name: string): void {
  const db = ConnectionSet.get(name);
  const reqs = RequestQueueSet.get(name) || [];
  while (true) {
    try {
      while (db && reqs.length > 0 && StateCommandMap.get(name) === StateCommand.open) {
        void reqs[0](db);
        void reqs.shift();
      }
      break;
    }
    catch (err) {
      void console.error(err, err + '', err.stack);
      void handleFromCrashState(name, err);
    }
  }
}

function handleFromInitialState(name: string, version: number = 0): void {
  const config = ConfigMap.get(name);
  assert(config);
  try {
    const openRequest = version
      ? indexedDB.open(name, version)
      : indexedDB.open(name);

    openRequest.onupgradeneeded = event =>
      void handleFromUpgradeState(name, openRequest);
    openRequest.onsuccess = _ =>
      void handleFromSuccessState(name, <IDBDatabase>openRequest.result);
    openRequest.onblocked = _ =>
      void handleFromBlockedState(name, openRequest);
    openRequest.onerror = event =>
      void handleFromErrorState(name, openRequest.error, event);
  }
  catch (err) {
    void handleFromCrashState(name, err);
  }
}

function handleFromBlockedState(name: string, openRequest: IDBOpenDBRequest): void {
  void IDBEventObserver.emit(new IDBEvent(IDBEvenType.block, name));
}

function handleFromUpgradeState(name: string, openRequest: IDBOpenDBRequest): void {
  const db: IDBDatabase = openRequest.result;
  assert(db);
  const {make, destroy} = ConfigMap.get(name);
  try {
    if (make(db)) {
      openRequest.onsuccess = _ =>
        void handleFromSuccessState(name, db);
      openRequest.onerror = event =>
        void handleFromErrorState(name, openRequest.error, event);
    }
    else {
      openRequest.onsuccess = openRequest.onerror = event => {
        void db.close();
        destroy(openRequest.error, event)
          ? void handleFromDestroyState(name)
          : void handleFromEndState(name);
      }
    }
  }
  catch (err) {
    void handleFromCrashState(name, err);
  }
}

function handleFromSuccessState(name: string, db: IDBDatabase): void {
  db.onversionchange = _ =>
    void db.close();
  db.end = () => {
    void ConnectionSet.delete(name);
    void db.close();
    void handleFromEndState(name);
  };
  db.destroy = () => {
    void ConnectionSet.delete(name);
    void db.close();
    void handleFromDestroyState(name);
  };
  db.onerror = event => {
    void ConnectionSet.delete(name);
    void handleFromErrorState(name, (<any>event.target).error, event);
  };
  db.onabort = event => {
    void ConnectionSet.delete(name);
    void handleFromAbortState(name, (<any>event.target).error, event);
  };

  switch (StateCommandMap.get(name)) {
    case StateCommand.open: {
      const {verify} = ConfigMap.get(name);
      try {
        if (!verify(db)) return void handleFromEndState(name, +db.version + 1);
        void IDBEventObserver.emit(new IDBEvent(IDBEvenType.connect, name));
        void ConnectionSet.add(name, db);
        void drain(name);
      }
      catch (err) {
        void handleFromCrashState(name, err);
      }
      return;
    }
    case StateCommand.close: {
      return void db.end();
    }
    case StateCommand.destroy: {
      return void db.destroy();
    }
  }
  throw new TypeError(`LocalSocket: Invalid command ${StateCommandMap.get(name)}.`);
}

function handleFromErrorState(name: string, error: DOMError, event: Event): void {
  void event.preventDefault();
  void ConnectionSet.delete(name);
  void IDBEventObserver.emit(new IDBEvent(IDBEvenType.error, name));
  const {destroy} = ConfigMap.get(name);
  if (destroy(error, event)) {
    return void handleFromDestroyState(name);
  }
  else {
    return void handleFromEndState(name);
  }
}

function handleFromAbortState(name: string, error: DOMError, event: Event): void {
  void event.preventDefault();
  void ConnectionSet.delete(name);
  void IDBEventObserver.emit(new IDBEvent(IDBEvenType.abort, name));
  const {destroy} = ConfigMap.get(name);
  if (destroy(error, event)) {
    return void handleFromDestroyState(name);
  }
  else {
    return void handleFromEndState(name);
  }
}

function handleFromCrashState(name: string, error: DOMError): void {
  void ConnectionSet.delete(name);
  void IDBEventObserver.emit(new IDBEvent(IDBEvenType.crash, name));
  const {destroy} = ConfigMap.get(name);
  if (destroy(error, null)) {
    return void handleFromDestroyState(name);
  }
  else {
    return void handleFromEndState(name);
  }
}

function handleFromDestroyState(name: string): void {
  void ConnectionSet.delete(name);
  const deleteRequest = indexedDB.deleteDatabase(name);
  deleteRequest.onsuccess = _ => {
    void RequestQueueSet.delete(name);
    void IDBEventObserver.emit(new IDBEvent(IDBEvenType.destroy, name));
    return void handleFromEndState(name);
  };
  deleteRequest.onerror = event => {
    void handleFromErrorState(name, deleteRequest.error, event);
  };
}

function handleFromEndState(name: string, version = 0): void {
  void ConnectionSet.delete(name);
  void IDBEventObserver.emit(new IDBEvent(IDBEvenType.disconnect, name));
  switch (StateCommandMap.get(name)) {
    case StateCommand.open: {
      return void handleFromInitialState(name, version);
    }
    case StateCommand.close: {
      void ConfigMap.delete(name);
      void StateSet.delete(name);
      return void 0;
    }
    case StateCommand.destroy: {
      void ConfigMap.delete(name);
      void StateSet.delete(name);
      return void 0;
    }
  }
  throw new TypeError(`LocalSocket: Invalid command ${StateCommandMap.get(name)}.`);
}
