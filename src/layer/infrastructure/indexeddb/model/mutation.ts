import { indexedDB } from '../module/global';
import { configs, commands, Command, states, InitialState, BlockState, UpgradeState, SuccessState, ErrorState, AbortState, CrashState, DestroyState, EndState } from './state';
import { idbEventStream_, IDBEvent, IDBEventType } from './event';

export function handleState(database: string): void {
  const state = states.get(database);
  if (!state) return void handleFromInitialState(new InitialState(database));
  if (state instanceof SuccessState) return void handleFromSuccessState(state);
}

function handleFromInitialState(state: InitialState): void {
  if (!state.alive) return;
  const { database, version } = state;
  assert(version >= 0);
  try {
    const openRequest = version
      ? indexedDB.open(database, version)
      : indexedDB.open(database);

    openRequest.onblocked = () =>
      void handleFromBlockedState(new BlockState(state, openRequest));
    openRequest.onupgradeneeded = () =>
      void handleFromUpgradeState(new UpgradeState(state, openRequest))
    openRequest.onsuccess = () =>
      void handleFromSuccessState(new SuccessState(state, <IDBDatabase>openRequest.result));
    openRequest.onerror = event =>
      void handleFromErrorState(new ErrorState(state, openRequest.error, event));
  }
  catch (err) {
    void handleFromCrashState(new CrashState(state, err));
  }
}

function handleFromBlockedState(state: BlockState): void {
  if (!state.alive) return;
  const { database, session } = state;
  session.onblocked = () =>
    void handleFromBlockedState(new BlockState(state, session));
  session.onupgradeneeded = () =>
    void handleFromUpgradeState(new UpgradeState(state, session));
  session.onsuccess = () =>
    void handleFromSuccessState(new SuccessState(state, <IDBDatabase>session.result));
  session.onerror = event =>
    void handleFromErrorState(new ErrorState(state, session.error, event));
  void idbEventStream_.emit([database, IDBEventType.block], new IDBEvent(database, IDBEventType.block));
}

function handleFromUpgradeState(state: UpgradeState): void {
  if (!state.alive) return;
  const { session } = state;
  const db: IDBDatabase = session.transaction.db;
  assert(db);
  const { make, destroy } = state.config;
  try {
    if (make(session.transaction)) {
      session.onsuccess = () =>
        void handleFromSuccessState(new SuccessState(state, db));
      session.onerror = event =>
        void handleFromErrorState(new ErrorState(state, session.error, event));
    }
    else {
      session.onsuccess = session.onerror = event => (
        void db.close(),
        destroy(session.error, event)
          ? void handleFromDestroyState(new DestroyState(state))
          : void handleFromEndState(new EndState(state)));
    }
  }
  catch (err) {
    void handleFromCrashState(new CrashState(state, err));
  }
}

function handleFromSuccessState(state: SuccessState): void {
  if (!state.alive) return;
  const { database, connection } = state;
  connection.onversionchange = () => (
    state.requests.length = 0,
    void connection.close(),
    void idbEventStream_.emit([database, IDBEventType.destroy], new IDBEvent(database, IDBEventType.destroy)),
    void handleFromEndState(new EndState(state)));
  connection.onerror = event =>
    void handleFromErrorState(new ErrorState(state, (<any>event.target).error, event));
  connection.onabort = event =>
    void handleFromAbortState(new AbortState(state, (<any>event.target).error, event));
  connection.onclose = () =>
    void handleFromEndState(new EndState(state));
  state.close = () =>
    void handleFromSuccessState(state);
  state.destroy = () =>
    void handleFromSuccessState(state);
  state.drain = () =>
    void handleFromSuccessState(state);

  switch (state.command) {
    case Command.open: {
      const { verify } = state.config;
      VERIFY: {
        try {
          if (verify(connection)) break VERIFY;
          void connection.close();
          return void handleFromEndState(new EndState(state, connection.version + 1));
        }
        catch (err) {
          void connection.close();
          return void handleFromCrashState(new CrashState(state, err));
        }
      }
      void idbEventStream_.emit([database, IDBEventType.connect], new IDBEvent(database, IDBEventType.connect));
      const reqs = state.requests;
      try {
        while (reqs.length > 0 && state.alive) {
          assert(state.command === Command.open);
          void reqs.shift()!(connection);
        }
      }
      catch (err) {
        assert(!console.debug(err + ''));
        void new Promise((_, reject) =>
          void reject(err));
        void connection.close();
        void handleFromCrashState(new CrashState(state, err));
      }
      return void 0;
    }
    case Command.close:
      void connection.close();
      return void handleFromEndState(new EndState(state));
    case Command.destroy:
      void connection.close();
      return void handleFromDestroyState(new DestroyState(state));
  }
  throw new TypeError(`ClientChannel: Invalid command ${state.command}.`);
}

function handleFromErrorState(state: ErrorState): void {
  if (!state.alive) return;
  const { database, error, event } = state;
  void event.preventDefault();
  void idbEventStream_.emit([database, IDBEventType.error], new IDBEvent(database, IDBEventType.error));
  const { destroy } = state.config;
  if (destroy(error, event)) {
    return void handleFromDestroyState(new DestroyState(state));
  }
  else {
    return void handleFromEndState(new EndState(state));
  }
}

function handleFromAbortState(state: AbortState): void {
  if (!state.alive) return;
  const { database, error, event } = state;
  void event.preventDefault();
  void idbEventStream_.emit([database, IDBEventType.abort], new IDBEvent(database, IDBEventType.abort));
  const { destroy } = state.config;
  if (destroy(error, event)) {
    return void handleFromDestroyState(new DestroyState(state));
  }
  else {
    return void handleFromEndState(new EndState(state));
  }
}

function handleFromCrashState(state: CrashState): void {
  if (!state.alive) return;
  const { database, error } = state;
  void idbEventStream_.emit([database, IDBEventType.crash], new IDBEvent(database, IDBEventType.crash));
  const { destroy } = state.config;
  if (destroy(error, null)) {
    return void handleFromDestroyState(new DestroyState(state));
  }
  else {
    return void handleFromEndState(new EndState(state));
  }
}

function handleFromDestroyState(state: DestroyState): void {
  if (!state.alive) return;
  const { database } = state;
  const deleteRequest = indexedDB.deleteDatabase(database);
  deleteRequest.onsuccess = () => (
    state.requests.length = 0,
    void idbEventStream_.emit([database, IDBEventType.destroy], new IDBEvent(database, IDBEventType.destroy)),
    void handleFromEndState(new EndState(state)));
  deleteRequest.onerror = event =>
    void handleFromErrorState(new ErrorState(state, deleteRequest.error, event));
}

function handleFromEndState(state: EndState): void {
  if (!state.alive) return;
  const { database, version } = state;
  assert(version >= 0);
  state.alive = false;
  void states.delete(database);
  switch (state.command) {
    case Command.open:
      void idbEventStream_
        .emit([database, IDBEventType.disconnect], new IDBEvent(database, IDBEventType.disconnect));
      return void handleFromInitialState(new InitialState(database, version));
    case Command.close:
      void commands.delete(database);
      void configs.delete(database);
      return void idbEventStream_
        .emit([database, IDBEventType.disconnect], new IDBEvent(database, IDBEventType.disconnect));
    case Command.destroy:
      void commands.delete(database);
      void configs.delete(database);
      state.requests.length = 0;
      return void idbEventStream_
        .emit([database, IDBEventType.disconnect], new IDBEvent(database, IDBEventType.disconnect));
  }
  throw new TypeError(`ClientChannel: Invalid command ${state.command}.`);
}
