import { indexedDB } from '../module/global';
import { isIDBAvailable, states, Command, InitialState, BlockState, UpgradeState, SuccessState, ErrorState, AbortState, CrashState, DestroyState, EndState } from './state';
import { idbEventStream$, IDBEvent, IDBEventType } from './event';
import { verifyStorageAccess } from '../../environment/api';
import { causeAsyncException } from 'spica/exception';

export function handle(database: string): void {
  const state = states.get(database);
  return state instanceof SuccessState
    ? void handleSuccessState(state)
    : void handleInitialState(new InitialState(database));
}

function handleInitialState(state: InitialState): void {
  if (!state.alive) return;
  const { database, version } = state;
  assert(version >= 0);
  try {
    const openRequest = version
      ? indexedDB.open(database, version)
      : indexedDB.open(database);

    openRequest.onblocked = () =>
      void handleBlockedState(new BlockState(state, openRequest));
    openRequest.onupgradeneeded = () =>
      void handleUpgradeState(new UpgradeState(state, openRequest))
    openRequest.onsuccess = () =>
      void handleSuccessState(new SuccessState(state, openRequest.result));
    openRequest.onerror = event =>
      void handleErrorState(new ErrorState(state, openRequest.error!, event));
  }
  catch (reason) {
    handleCrashState(new CrashState(state, reason));
  }
}

function handleBlockedState(state: BlockState): void {
  if (!state.alive) return;
  const { database, session } = state;
  session.onblocked = () =>
    void handleBlockedState(new BlockState(state, session));
  session.onupgradeneeded = () =>
    void handleUpgradeState(new UpgradeState(state, session));
  session.onsuccess = () =>
    void handleSuccessState(new SuccessState(state, session.result));
  session.onerror = event =>
    void handleErrorState(new ErrorState(state, session.error!, event));
  idbEventStream$.emit([database, IDBEventType.block], new IDBEvent(database, IDBEventType.block));
}

function handleUpgradeState(state: UpgradeState): void {
  if (!state.alive) return;
  const { session, config } = state;
  assert(session.transaction);
  const db: IDBDatabase = session.transaction!.db;
  assert(db);
  try {
    if (config.make(session.transaction!)) {
      session.onsuccess = () =>
        void handleSuccessState(new SuccessState(state, db));
      session.onerror = event =>
        void handleErrorState(new ErrorState(state, session.error!, event));
    }
    else {
      session.onsuccess = session.onerror = event => (
        void db.close(),
        config.destroy(session.error, event)
          ? void handleDestroyState(new DestroyState(state))
          : void handleEndState(new EndState(state)));
    }
  }
  catch (reason) {
    handleCrashState(new CrashState(state, reason));
  }
}

function handleSuccessState(state: SuccessState): void {
  if (!state.alive) return;
  const { database, connection, config, queue } = state;

  connection.onversionchange = () => {
    const curr = new EndState(state);
    connection.close();
    idbEventStream$.emit([database, IDBEventType.destroy], new IDBEvent(database, IDBEventType.destroy));
    handleEndState(curr);
  };
  connection.onerror = event =>
    void handleErrorState(new ErrorState(state, (event.target as any).error, event));
  connection.onabort = event =>
    void handleAbortState(new AbortState(state, event));
  connection.onclose = () =>
    void handleEndState(new EndState(state));

  switch (state.command) {
    case Command.open: {
      VALIDATION:
      try {
        if (config.verify(connection)) break VALIDATION;
        connection.close();
        return void handleEndState(new EndState(state, connection.version + 1));
      }
      catch (reason) {
        connection.close();
        return void handleCrashState(new CrashState(state, reason));
      }
      idbEventStream$.emit([database, IDBEventType.connect], new IDBEvent(database, IDBEventType.connect));
      try {
        while (queue.size > 0 && state.alive) {
          assert(state.command === Command.open);
          const { success, failure } = queue.dequeue()!;
          try {
            success(connection);
          }
          catch (reason) {
            failure(reason);
            throw reason;
          }
        }
        return;
      }
      catch (reason) {
        assert(!void console.error(reason + ''));
        causeAsyncException(reason);
        const curr = new CrashState(state, reason);
        connection.close();
        return void handleCrashState(curr);
      }
    }
    case Command.close: {
      const curr = new EndState(state);
      connection.close();
      return void handleEndState(curr);
    }
    case Command.destroy: {
      const curr = new DestroyState(state);
      connection.close();
      return void handleDestroyState(curr);
    }
  }
}

function handleErrorState(state: ErrorState): void {
  if (!state.alive) return;
  const { database, error, event, config } = state;
  assert(error);
  event.preventDefault();
  idbEventStream$.emit([database, IDBEventType.error], new IDBEvent(database, IDBEventType.error));
  if (config.destroy(error, event)) {
    return void handleDestroyState(new DestroyState(state));
  }
  else {
    return void handleEndState(new EndState(state));
  }
}

function handleAbortState(state: AbortState): void {
  if (!state.alive) return;
  const { database, event } = state;
  event.preventDefault();
  idbEventStream$.emit([database, IDBEventType.abort], new IDBEvent(database, IDBEventType.abort));
  return void handleEndState(new EndState(state));
}

function handleCrashState(state: CrashState): void {
  if (!state.alive) return;
  const { database, reason, config } = state;
  idbEventStream$.emit([database, IDBEventType.crash], new IDBEvent(database, IDBEventType.crash));
  if (config.destroy(reason)) {
    return void handleDestroyState(new DestroyState(state));
  }
  else {
    return void handleEndState(new EndState(state));
  }
}

function handleDestroyState(state: DestroyState): void {
  if (!state.alive) return;
  if (!isIDBAvailable || !verifyStorageAccess()) return void handleEndState(new EndState(state));
  const { database } = state;
  const deleteRequest = indexedDB.deleteDatabase(database);
  deleteRequest.onsuccess = () => (
    void idbEventStream$.emit([database, IDBEventType.destroy], new IDBEvent(database, IDBEventType.destroy)),
    void handleEndState(new EndState(state)));
  deleteRequest.onerror = event =>
    void handleErrorState(new ErrorState(state, deleteRequest.error!, event));
}

function handleEndState(state: EndState): void {
  if (!state.alive) return;
  const { database, version, command } = state;
  assert(version >= 0);
  state.complete();
  idbEventStream$
    .emit([database, IDBEventType.disconnect], new IDBEvent(database, IDBEventType.disconnect));
  if (!isIDBAvailable || !verifyStorageAccess()) return;
  switch (command) {
    case Command.open:
      return void handleInitialState(new InitialState(database, version));
    case Command.close:
    case Command.destroy:
      return;
  }
}
