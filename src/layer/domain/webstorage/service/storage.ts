import {Map} from 'arch-stream';

interface StorageLike extends Storage {
}
class StorageLike {
  private store = new Map<string, string>();
  public get length(): number {
    return this.store.size;
  }
  public getItem(key: string): string {
    return this.store.has(key)
      ? this.store.get(key)
      : null;
  }
  public setItem(key: string, data: string): void {
    void this.store.set(key, data);
  }
  public removeItem(key: string): void {
    void this.store.delete(key);
  }
  public clear(): void {
    void this.store.clear();
  }
}

export const fakeStorage = new StorageLike();
