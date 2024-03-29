export let isIDBAvailable = true;

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
  public enqueue(success: (db: IDBDatabase) => void, failure: (reason: unknown) => void): void {
    const state = states.get(this.database);
    if (!state || !state.alive || state.queue !== this) return void failure(new Error('Request is invalid.'));
    this.queue.push({ success, failure });
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
          this.queue.shift()!.failure(new Error('Request is cancelled.'));
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
  failure: (reason: unknown) => void;
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
    assert(!this.alive);
    if (curr?.alive === false) return;
    if (this instanceof InitialState) {
      this.alive = !curr;
      if (!this.alive) return;
      assert(!states.has(database));
      requests.set(database, requests.get(database) || new RequestQueue(database));
    }
    else {
      assert(requests.has(database));
      assert(curr?.alive);
      this.alive = !!curr;
      if (!this.alive || !curr) return;
      curr.alive = false;
    }
    assert(!curr || !curr.alive);
    assert(this.alive);
    states.set(database, this);
  }
  public alive = false;
  public get command(): Command {
    assert(this.alive);
    assert(commands.has(this.database));
    return commands.get(this.database)!;
  }
  public get config(): Config {
    assert(this.alive);
    assert(configs.has(this.database));
    return configs.get(this.database)!;
  }
  public get queue(): RequestQueue {
    assert(this.alive);
    assert(requests.has(this.database));
    return requests.get(this.database)!;
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
    isIDBAvailable = true;
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
    if (state instanceof InitialState && error.message === 'A mutation operation was attempted on a database that did not allow mutations.') {
      isIDBAvailable = false;
    }
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
  public complete(): void {
    assert(this.alive);
    switch (this.command) {
      case Command.close:
      case Command.destroy:
        requests.get(this.database)?.clear();
        commands.delete(this.database);
        configs.delete(this.database);
        requests.delete(this.database);
    }
    states.delete(this.database);
    this.alive = false;
  }
}
