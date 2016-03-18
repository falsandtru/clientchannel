import {localStorage} from '../../../infrastructure/webstorage/api';
import {repository} from '../repository/port';

const VERSION = 1;

export class WebStorageLog {
  private version = VERSION;
  private verify(): boolean {
    if (this.version === VERSION) return true;
    this.logs = Object.create(null);
    if (this.version > VERSION || !this.version) {
      this.logs = this.logs;
    }
    return false;
  }
  public logs: {
    [name: string]: number;
  } = Object.create(null);
  public has(name: string): boolean {
    void this.verify();
    return name in this.logs;
  }
  public get(name: string): number {
    void this.verify();
    return this.logs[name] || 0;
  }
  public update(name: string): void {
    void this.verify();
    this.logs[name] = Date.now();
  }
  public delete(name: string): void {
    void this.verify();
    delete this.logs[name];
  }
  private clear(): void {
    void this.verify();
    this.logs = Object.create(null);
  }
  public commit(): void {
    if (!this.verify()) return;
    this.logs = this.logs;
  }
  public entries(): [string, number][] {
    if (!this.verify()) return [];
    return Object.keys(this.logs)
      .map<[string, number]>(name => [name, this.logs[name]]);
  }
}

export const namespace = 'localsocket::log';
export const log = localStorage
  ? repository(namespace, localStorage, () => new WebStorageLog()).link()
  : new WebStorageLog();

void setInterval((): void => void log.commit(), 1e3);
void window.addEventListener('unload', () => void log.commit());
