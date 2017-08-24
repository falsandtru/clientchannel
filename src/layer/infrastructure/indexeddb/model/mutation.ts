import { indexedDB } from '../module/global';
import { configs, Config, commands, Command, requests, Requests, states, InitialState, BlockState, UpgradeState, SuccessState, ErrorState, AbortState, CrashState, DestroyState, EndState } from './state';
import { idbEventStream_, IDBEvent, IDBEventType } from './event';

export function operate(database: string, command: Command, config: Config): void {
  if (commands.get(database) === Command.destroy) {
    assert(states.has(database));
    switch (command) {
      case Command.open:
      case Command.close:
        return void idbEventStream_
          .once([database, IDBEventType.destroy], () =>
            void operate(database, command, config));
    }
  }
  void commands.set(database, command);
  void configs.set(database, config);
  if (states.has(database)) {
    assert(requests.has(database));
    return void request(database, () => void 0, () => void 0);
  }
  else {
    void requests.set(database, requests.get(database) || new Requests(database));
    assert(commands.get(database) === command);
    assert(configs.get(database) === config);
    return void handleFromInitialState(new InitialState(database));
  }
}

export function request(database: string, success: (db: IDBDatabase) => void, failure: () => void = () => void 0): void {
  return requests.has(database)
    ? void requests.get(database)!.add(success, failure)
    : void failure();
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
      void handleFromSuccessState(new SuccessState(state, openRequest.result as IDBDatabase));
    openRequest.onerror = event =>
      void handleFromErrorState(new ErrorState(state, openRequest.error, event));
  }
  catch (reason) {
    void handleFromCrashState(new CrashState(state, reason));
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
    void handleFromSuccessState(new SuccessState(state, session.result as IDBDatabase));
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
  catch (reason) {
    void handleFromCrashState(new CrashState(state, reason));
  }
}

function handleFromSuccessState(state: SuccessState): void {
  if (!state.alive) return;
  const { database, connection, requests } = state;
  connection.onversionchange = () => (
    void connection.close(),
    void idbEventStream_.emit([database, IDBEventType.destroy], new IDBEvent(database, IDBEventType.destroy)),
    void requests.clear(),
    void handleFromEndState(new EndState(state)));
  connection.onerror = event =>
    void handleFromErrorState(new ErrorState(state, (event.target as any).error, event));
  connection.onabort = event =>
    void handleFromAbortState(new AbortState(state, event));
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
        catch (reason) {
          void connection.close();
          return void handleFromCrashState(new CrashState(state, reason));
        }
      }
      void idbEventStream_.emit([database, IDBEventType.connect], new IDBEvent(database, IDBEventType.connect));
      return void requests.resolve(state, reason => {
        assert(!console.error(reason + ''));
        void new Promise((_, reject) =>
          void reject(reason));
        void connection.close();
        void handleFromCrashState(new CrashState(state, reason));
      });
    }
    case Command.close:
      void connection.close();
      return void handleFromEndState(new EndState(state));
    case Command.destroy:
      void connection.close();
      return void handleFromDestroyState(new DestroyState(state));
  }
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
  const { database, event } = state;
  void event.preventDefault();
  void idbEventStream_.emit([database, IDBEventType.abort], new IDBEvent(database, IDBEventType.abort));
  return void handleFromEndState(new EndState(state));
}

function handleFromCrashState(state: CrashState): void {
  if (!state.alive) return;
  const { database, reason } = state;
  void idbEventStream_.emit([database, IDBEventType.crash], new IDBEvent(database, IDBEventType.crash));
  const { destroy } = state.config;
  if (destroy(reason)) {
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
    void idbEventStream_.emit([database, IDBEventType.destroy], new IDBEvent(database, IDBEventType.destroy)),
    void state.requests.clear(),
    void handleFromEndState(new EndState(state)));
  deleteRequest.onerror = event =>
    void handleFromErrorState(new ErrorState(state, deleteRequest.error, event));
}

function handleFromEndState(state: EndState): void {
  if (!state.alive) return;
  const { database, version, command } = state;
  assert(version >= 0);
  void state.complete();
  void idbEventStream_
    .emit([database, IDBEventType.disconnect], new IDBEvent(database, IDBEventType.disconnect));
  switch (command) {
    case Command.open:
      return void handleFromInitialState(new InitialState(database, version));
    case Command.close:
    case Command.destroy:
      return;
  }
}
