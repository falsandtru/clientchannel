export const configs = new Map<string, Config>();
export type Config = {
  make: (tx: IDBTransaction) => boolean;
  verify: (db: IDBDatabase) => boolean;
  destroy: (reason: any, event?: Event) => boolean;
};

export const commands = new Map<string, Command>();
export const enum Command {
  open = 1,
  close,
  destroy,
}

export const requests = new Map<string, Request[]>();
export type Request = (db: IDBDatabase) => void;


export const states = new Map<string, State>();

abstract class State {
  constructor(
    public readonly database: string,
  ) {
    assert(this.command);
    assert(this.config);
    const state = states.get(database);
    switch (true) {
      case this instanceof InitialState:
        if (state) {
          this.alive = false;
        }
        break;
      default:
        if (state) {
          this.alive = this.alive && state.alive;
          state.alive = false;
        }
    }
    if (this.alive) {
      void states.set(database, this);
    }
  }
  public alive = !!this.command && !!this.config;
  public get command(): Command {
    assert(commands.has(this.database));
    return commands.get(this.database)!;
  }
  public set command(command: Command) {
    void commands.set(this.database, command);
  }
  public get config(): Config {
    assert(configs.has(this.database));
    return configs.get(this.database)!;
  }
  public set config(config: Config) {
    void configs.set(this.database, config);
  }
  public get requests(): Request[] {
    return requests
      .set(this.database, requests.get(this.database) || [])
      .get(this.database)!;
  }
}

export class InitialState extends State {
  private readonly STATE: this;
  constructor(
    database: string,
    public readonly version: number = 0,
  ) {
    super(database);
    this.STATE;
  }
}

export class BlockState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState,
    public readonly session: IDBOpenDBRequest
  ) {
    super(state.database);
    this.STATE;
  }
}

export class UpgradeState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState,
    public readonly session: IDBOpenDBRequest
  ) {
    super(state.database);
    this.STATE;
  }
}

export class SuccessState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | BlockState | UpgradeState,
    public readonly connection: IDBDatabase
  ) {
    super(state.database);
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
    super(state.database);
    this.STATE;
  }
}

export class AbortState extends State {
  private readonly STATE: this;
  constructor(
    state: SuccessState,
    public readonly error: DOMException | DOMError,
    public readonly event: Event
  ) {
    super(state.database);
    this.STATE;
  }
}

export class CrashState extends State {
  private readonly STATE: this;
  constructor(
    state: InitialState | UpgradeState | SuccessState,
    public readonly reason: any
  ) {
    super(state.database);
    this.STATE;
  }
}

export class DestroyState extends State {
  private readonly STATE: this;
  constructor(
    state: UpgradeState | SuccessState | ErrorState | AbortState | CrashState,
  ) {
    super(state.database);
    this.STATE;
  }
}

export class EndState extends State {
  private readonly STATE: this;
  constructor(
    state: UpgradeState | SuccessState | ErrorState | AbortState | CrashState | DestroyState,
    public readonly version: number = 0,
  ) {
    super(state.database);
    this.STATE;
  }
}
