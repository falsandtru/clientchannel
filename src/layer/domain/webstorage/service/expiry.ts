import {localStorage} from '../../../infrastructure/webstorage/api';
import {repository} from '../repository/port';
import {log} from './log';

const VERSION = 1;

export class WebStorageExpiry {
  private version = VERSION;
  private verify(): boolean {
    if (this.version === VERSION) return true;
    this.expiries = Object.create(null);
    if (this.version > VERSION || !this.version) {
      this.expiries = this.expiries;
    }
    return false;
  }
  public expiries: {
    [name: string]: number;
  } = Object.create(null);
  public has(name: string): boolean {
    void this.verify();
    return name in this.expiries;
  }
  public get(name: string): number {
    void this.verify();
    return this.expiries[name] || 0;
  }
  public add(name: string, expiry: number): void {
    void this.verify();
    this.expiries[name] = expiry;
    void this.clean_(name);
  }
  public delete(name: string): void {
    void this.verify();
    delete this.expiries[name];
  }
  private clear(): void {
    void this.verify();
    this.expiries = Object.create(null);
  }
  public commit(): void {
    if (!this.verify()) return;
    this.expiries = this.expiries;
  }
  public entries(): [string, number][] {
    if (!this.verify()) return [];
    return Object.keys(this.expiries)
      .map<[string, number]>(name => [name, this.expiries[name]]);
  }
  public clean(now = Date.now()): void {
    void expiry.entries()
      .forEach(([name]) => void this.clean_(name, now));
  }
  private clean_(name: string, now: number = Date.now()): void {
    if (!log.has(name) || !expiry.has(name)) return;
    if (log.get(name) + expiry.get(name) > now) return;
    void repository(name, localStorage, Object).destroy();
    void expiry.delete(name);
    void log.delete(name);
  }
}

export const namespace = 'localsocket::expiry';
export const expiry = localStorage
  ? repository(namespace, localStorage, () => new WebStorageExpiry()).link()
  : new WebStorageExpiry();

void setInterval((): void => void expiry.commit(), 1e3);
void window.addEventListener('unload', () => void expiry.commit());

void expiry.clean();
