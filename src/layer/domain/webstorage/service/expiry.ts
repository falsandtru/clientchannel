import {localStorage} from '../../../infrastructure/webstorage/api';
import {repository} from '../repository/port';

export class WebStorageExpiry {
  public expiries: {
    [name: string]: WebStorageExpiryRecord;
  } = {};
  public add(name: string, life: number): void {
    this.expiries[name] = this.expiries[name] || new WebStorageExpiryRecord(name, new WebStorageExpiryRecordLife(life));
  }
  public delete(name: string): void {
    delete this.expiries[name];
  }
  public commit(): void {
    this.expiries = this.expiries;
  }
  public entries(): [string, WebStorageExpiryRecord][] {
    return Object.keys(this.expiries)
      .map<[string, WebStorageExpiryRecord]>(name => [name, this.expiries[name]]);
  }
}

class WebStorageExpiryRecord {
  constructor(
    public name: string,
    public life: WebStorageExpiryRecordLife
  ) {
  }
}

class WebStorageExpiryRecordLife {
  constructor(
    public max: number
  ) {
  }
  public atime = Date.now();
  public value = this.max;
}

const name = 'localsocket::expiry';
export const expiry = localStorage
  ? repository(name, localStorage, () => new WebStorageExpiry(), Infinity).link()
  : new WebStorageExpiry();
