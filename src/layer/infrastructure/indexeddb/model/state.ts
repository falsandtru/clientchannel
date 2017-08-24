export const commands = new Map<string, Command>();
export const enum Command {
  open = 'open',
  close = 'close',
  destroy = 'destroy',
}

export const configs = new Map<string, Config>();
export interface Config {
  make: (tx: IDBTransaction) => boolean;
  verify: (db: IDBDatabase) => boolean;
  destroy: (reason: any, event?: Event) => boolean;
}

export const requests = new Map<string, Requests>();
export class Requests {
  constructor(
    private database: string,
  ) {
  }
  private queue: Request[] = [];
  public add(success: (db: IDBDatabase) => void, failure: () => void): void {
    const state = states.get(this.database);
    if (!state) return void failure();
    void this.queue.push({ success, failure });
    if (!(state instanceof SuccessState)) return;
    void state.drain();
  }
  public resolve(state: SuccessState, catcher: (reason: any) => void): void {
    try {
      while (this.queue.length > 0 && state.alive) {
        assert(state.command === Command.open);
        void this.queue.shift()!.success(state.connection);
      }
    }
    catch (reason) {
      void catcher(reason);
    }
  }
  public clear(): void {
    try {
      while (this.queue.length > 0) {
        void this.queue.shift()!.failure();
      }
    }
    catch (_) {
      return this.clear();
    }
  }
}
interface Request {
  success: (db: IDBDatabase) => void;
  failure: () => void;
}

export const states = new Map<string, State>();
abstract class State {
  constructor(
    public readonly database: string,
    curr?: State,
  ) {
    assert(!curr || curr.alive);
    assert(commands.has(database));
    assert(configs.has(database));
    assert(requests.has(database));
    switch (true) {
      case this instanceof InitialState:
        this.alive = !curr;
        break;
      default:
        assert(curr);
        this.alive = !!curr && curr.alive;
    }
    if (!this.alive) return;
    void states.set(database, this);
    if (curr) {
      curr.alive = false;
    }
  }
  public alive = true;
  public get command(): Command {
    assert(this.alive);
    assert(commands.has(this.database));
    return commands.get(this.database)!
        || Command.close;
  }
  public get config(): Config {
    assert(this.alive);
    assert(configs.has(this.database));
    return configs.get(this.database)!
        || {
             make() {
               return false;
             },
             verify() {
               return false;
             },
             destroy() {
               return false;
             },
           };
  }
  public get requests(): Requests {
    assert(this.alive);
    assert(requests.has(this.database));
    return requests.get(this.database)!
        || new Requests(this.database);
  }
}

export class InitialState extends State {
  private readonly STATE: this;
  constructor(
    database: string,
    public readonly version: number = 0,
  ) {
    super(database, states.get(database));
    this.STATE;
  }
}

export class BlockState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState,
    public readonly session: IDBOpenDBRequest
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class UpgradeState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState,
    public readonly session: IDBOpenDBRequest
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class SuccessState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState | UpgradeState,
    public readonly connection: IDBDatabase
  ) {
    super(state.database, state);
    this.STATE;
  }
  public drain: () => void;
  public close: () => void;
  public destroy: () => void;
}

export class ErrorState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState | UpgradeState | SuccessState | DestroyState,
    public readonly error: DOMException | DOMError,
    public readonly event: Event
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class AbortState extends State {
  private readonly STATE: this;
  constructor(
    state: SuccessState,
    public readonly event: Event
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class CrashState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | UpgradeState | SuccessState,
    public readonly reason: any
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class DestroyState extends State {
  private readonly STATE: this;
  constructor(
    state: UpgradeState | SuccessState | ErrorState | AbortState | CrashState,
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class EndState extends State {
  private readonly STATE: this;
  constructor(
    state: UpgradeState | SuccessState | ErrorState | AbortState | CrashState | DestroyState,
    public readonly version: number = 0,
  ) {
    super(state.database, state);
    this.STATE;
  }
  public complete(): void {
    if (!this.alive) return;
    const { command } = this;
    this.alive = false;
    void states.delete(this.database);
    switch (command) {
      case Command.close:
      case Command.destroy:
        void commands.delete(this.database);
        void configs.delete(this.database);
        void requests.delete(this.database);
    }
  }
}
