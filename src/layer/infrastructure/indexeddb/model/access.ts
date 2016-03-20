import {Observable, IObservableObserver, Set, Map, Timer} from 'arch-stream';
import {indexedDB} from '../module/global';
import {IDBEvent, IDBEvenTypes} from './event';
import {supportWebStorage as status} from '../../webstorage/api';

const IDBEventObserver = new Observable<[string] | [string, string], IDBEvent, void>();
export const event: IObservableObserver<[string] | [string, string], IDBEvent, void> = IDBEventObserver;

export type Config = {
  make: (db: IDBDatabase) => boolean;
  verify: (db: IDBDatabase) => boolean;
  destroy: (error: DOMError, event: Event) => boolean;
};
export const ConfigMap = new Map<string, Config>();

const enum StateTypes {
  open,
  close,
  destroy
}
const StateMap = new Map<string, StateTypes>();

type Request = (db: IDBDatabase) => any;
const RequestQueueSet = new Set<string, Request[]>();
const ConnectionStateSet = new Set<string, void>();
const ConnectionHandleSet = new Set<string, IDBDatabase>();

export type Access = (req: Request) => any;

export function open(name: string, config: Config): void {
  void StateMap.set(name, StateTypes.open);
  void ConfigMap.set(name, config);
  if (ConnectionStateSet.has(name)) return;
  void ConnectionStateSet.add(name, void 0);
  void handleFromInitialState(name);
}
export function listen(name: string): Access {
  return (req: Request) => {
    const queue = RequestQueueSet.get(name) || RequestQueueSet.add(name, []);
    void queue.push(req);
    void drain(name);
  };
}
export function close(name: string): void {
  void StateMap.set(name, StateTypes.close);
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
  if (ConnectionHandleSet.has(name)) return ConnectionHandleSet.get(name).end();
  if (ConnectionStateSet.has(name)) return;
  void ConnectionStateSet.add(name, void 0);
  void handleFromInitialState(name);
}
export function destroy(name: string): void {
  void StateMap.set(name, StateTypes.destroy);
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
  if (ConnectionHandleSet.has(name)) return ConnectionHandleSet.get(name).destroy();
  if (ConnectionStateSet.has(name)) return;
  void ConnectionStateSet.add(name, void 0);
  void handleFromInitialState(name);
}

function drain(name: string): void {
  if (!status) return void RequestQueueSet.delete(name);
  if (!ConnectionHandleSet.has(name) || !ConfigMap.has(name)) return;
  const db = ConnectionHandleSet.get(name);
  const reqs = RequestQueueSet.get(name) || [];
  try {
    while (db && reqs.length > 0 && StateMap.get(name) === StateTypes.open) {
      void reqs[0](db);
      void reqs.shift();
    }
  }
  catch (err) {
    if (err instanceof Error) {
      void console.error(err, err + '', err.stack);
    }
    else {
      void console.error(err);
    }
    void handleFromCrashState(name, err);
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
  void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.block]], new IDBEvent(IDBEvenTypes.block, name));
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
    void ConnectionHandleSet.delete(name);
    void db.close();
    void handleFromEndState(name);
  };
  db.destroy = () => {
    void ConnectionHandleSet.delete(name);
    void db.close();
    void handleFromDestroyState(name);
  };
  db.onerror = event => {
    void ConnectionHandleSet.delete(name);
    void handleFromErrorState(name, (<any>event.target).error, event);
  };
  db.onabort = event => {
    void ConnectionHandleSet.delete(name);
    void handleFromAbortState(name, (<any>event.target).error, event);
  };

  switch (StateMap.get(name)) {
    case StateTypes.open: {
      const {verify} = ConfigMap.get(name);
      try {
        if (!verify(db)) return void handleFromEndState(name, +db.version + 1);
      }
      catch (err) {
        return void handleFromCrashState(name, err);
      }
      void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.connect]], new IDBEvent(IDBEvenTypes.connect, name));
      void ConnectionHandleSet.add(name, db);
      return void drain(name);
    }
    case StateTypes.close: {
      return void db.end();
    }
    case StateTypes.destroy: {
      return void db.destroy();
    }
  }
  throw new TypeError(`LocalSocket: Invalid command ${StateMap.get(name)}.`);
}

function handleFromErrorState(name: string, error: DOMError, event: Event): void {
  void event.preventDefault();
  void ConnectionHandleSet.delete(name);
  void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.error]], new IDBEvent(IDBEvenTypes.error, name));
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
  void ConnectionHandleSet.delete(name);
  void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.abort]], new IDBEvent(IDBEvenTypes.abort, name));
  const {destroy} = ConfigMap.get(name);
  if (destroy(error, event)) {
    return void handleFromDestroyState(name);
  }
  else {
    return void handleFromEndState(name);
  }
}

function handleFromCrashState(name: string, error: DOMError): void {
  void ConnectionHandleSet.delete(name);
  void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.crash]], new IDBEvent(IDBEvenTypes.crash, name));
  const {destroy} = ConfigMap.get(name);
  if (destroy(error, null)) {
    return void handleFromDestroyState(name);
  }
  else {
    return void handleFromEndState(name);
  }
}

function handleFromDestroyState(name: string): void {
  void ConnectionHandleSet.delete(name);
  const deleteRequest = indexedDB.deleteDatabase(name);
  deleteRequest.onsuccess = _ => {
    void RequestQueueSet.delete(name);
    void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.destroy]], new IDBEvent(IDBEvenTypes.destroy, name));
    return void handleFromEndState(name);
  };
  deleteRequest.onerror = event => {
    void handleFromErrorState(name, deleteRequest.error, event);
  };
}

function handleFromEndState(name: string, version = 0): void {
  void ConnectionHandleSet.delete(name);
  void IDBEventObserver.emit([name, IDBEvenTypes[IDBEvenTypes.disconnect]], new IDBEvent(IDBEvenTypes.disconnect, name));
  switch (StateMap.get(name)) {
    case StateTypes.open: {
      return void handleFromInitialState(name, version);
    }
    case StateTypes.close: {
      void ConfigMap.delete(name);
      void ConnectionStateSet.delete(name);
      return void 0;
    }
    case StateTypes.destroy: {
      void ConfigMap.delete(name);
      void ConnectionStateSet.delete(name);
      return void 0;
    }
  }
  throw new TypeError(`LocalSocket: Invalid command ${StateMap.get(name)}.`);
}
