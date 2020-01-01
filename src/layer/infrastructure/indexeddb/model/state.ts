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
  destroy: (reason: unknown, event?: Event) => boolean;
}

export const requests = new Map<string, RequestQueue>();
class RequestQueue {
  constructor(
    private database: string,
  ) {
  }
  private queue: Request[] = [];
  public enqueue(success: (db: IDBDatabase) => void, failure: () => void): void {
    const state = states.get(this.database);
    if (!state || !state.alive || state.queue !== this) return void failure();
    void this.queue.push({ success, failure });
  }
  public dequeue(): Request | undefined {
    return this.queue.shift();
  }
  public get size(): number {
    return this.queue.length;
  }
  public clear(): void {
    while (true) {
      try {
        while (this.queue.length > 0) {
          void this.queue.shift()!.failure();
        }
        return;
      }
      catch {
        continue;
      }
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
    curr: State | undefined,
  ) {
    assert(!curr || curr.alive);
    assert(commands.has(database));
    assert(configs.has(database));
    switch (true) {
      case this instanceof InitialState:
        this.alive = !curr;
        if (!this.alive) return;
        void requests.set(database, requests.get(database) || new RequestQueue(database));
        break;
      default:
        assert(requests.has(database));
        assert(curr);
        this.alive = !!curr && curr.alive;
        if (!this.alive) return;
    }
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
  public get queue(): RequestQueue {
    assert(this.alive);
    assert(requests.has(this.database));
    return requests.get(this.database)!
        || new RequestQueue(this.database);
  }
}

export class InitialState extends State {
  private readonly STATE!: this;
  constructor(
    database: string,
    public readonly version: number = 0,
  ) {
    super(database, states.get(database));
    this.STATE;
  }
}

export class BlockState extends State {
  private readonly STATE!: this;
  constructor(
    state: InitialState | BlockState,
    public readonly session: IDBOpenDBRequest
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class UpgradeState extends State {
  private readonly STATE!: this;
  constructor(
    state: InitialState | BlockState,
    public readonly session: IDBOpenDBRequest
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class SuccessState extends State {
  private readonly STATE!: this;
  constructor(
    state: InitialState | BlockState | UpgradeState,
    public readonly connection: IDBDatabase
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class ErrorState extends State {
  private readonly STATE!: this;
  constructor(
    state: InitialState | BlockState | UpgradeState | SuccessState | DestroyState,
    public readonly error: DOMException,
    public readonly event: Event
  ) {
    super(state.database, state);
    this.STATE;
    assert(error);
  }
}

export class AbortState extends State {
  private readonly STATE!: this;
  constructor(
    state: SuccessState,
    public readonly event: Event
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class CrashState extends State {
  private readonly STATE!: this;
  constructor(
    state: InitialState | UpgradeState | SuccessState,
    public readonly reason: unknown
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class DestroyState extends State {
  private readonly STATE!: this;
  constructor(
    state: UpgradeState | SuccessState | ErrorState | AbortState | CrashState,
  ) {
    super(state.database, state);
    this.STATE;
  }
}

export class EndState extends State {
  private readonly STATE!: this;
  constructor(
    state: UpgradeState | SuccessState | ErrorState | AbortState | CrashState | DestroyState,
    public readonly version: number = 0,
  ) {
    super(state.database, state);
    this.STATE;
  }
  public get command(): Command {
    return commands.get(this.database)!
        || Command.close;
  }
  public complete(): void {
    if (!this.alive) return;
    switch (this.command) {
      case Command.close:
      case Command.destroy:
        if (requests.has(this.database)) {
          void requests.get(this.database)!.clear();
        }
        void commands.delete(this.database);
        void configs.delete(this.database);
        void requests.delete(this.database);
    }
    void states.delete(this.database);
    this.alive = false;
  }
}
