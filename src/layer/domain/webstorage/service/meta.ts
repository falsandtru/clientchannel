import {localStorage} from '../../../infrastructure/webstorage/api';
import {repository} from '../repository/store';

export class WebStorageMetaData {
  public expires: {
    [name: string]: WebStorageMetaDataItem;
  } = {};
  public add(name: string, life: number): void {
    this.expires[name] = this.expires[name] || new WebStorageMetaDataItem(name, new WebStorageMetaDataItemExpire(life));
  }
  public delete(name: string): void {
    delete this.expires[name];
  }
  public commit(): void {
    this.expires = this.expires;
  }
  public entries(): [string, WebStorageMetaDataItem][] {
    return Object.keys(this.expires)
      .map<[string, WebStorageMetaDataItem]>(name => [name, this.expires[name]]);
  }
}

class WebStorageMetaDataItem {
  constructor(
    public name: string,
    public expire: WebStorageMetaDataItemExpire
  ) {
  }
}

class WebStorageMetaDataItemExpire {
  constructor(
    public life: number
  ) {
  }
  public atime = Date.now();
  public rest = this.life;
}

const name = 'localsocket::meta';
export const meta = repository(name, localStorage, () => new WebStorageMetaData(), Infinity).link();
