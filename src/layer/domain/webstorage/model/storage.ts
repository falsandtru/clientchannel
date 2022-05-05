export interface StorageLike {
  readonly length: number;
  getItem(key: string): string | null;
  setItem(key: string, data: string): void;
  removeItem(key: string): void;
  clear(): void;
}

class Storage implements StorageLike {
  private readonly store = new Map<string, string>();
  public get length(): number {
    return this.store.size;
  }
  public getItem(key: string): string | null {
    return this.store.has(key)
      ? this.store.get(key)!
      : null;
  }
  public setItem(key: string, data: string): void {
    this.store.set(key, data);
  }
  public removeItem(key: string): void {
    this.store.delete(key);
  }
  public clear(): void {
    this.store.clear();
  }
}

export const fakeStorage: StorageLike = new Storage();
