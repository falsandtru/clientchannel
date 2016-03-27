export type IdNumber = Id & number;
declare class ID {
  private ID;
}
interface Id extends ID {
}

/*
export function IdNumber<T extends number>(id: void): void
export function IdNumber<T extends number>(id: Id & T): void
export function IdNumber<T extends number>(id: T): Id & T
*/
export function IdNumber<T extends number>(id: T): Id & T {
  return <Id & T>+id;
}

export type KeyString = Key & string;
declare class KEY {
  private KEY;
}
interface Key extends KEY {
}

/*
export function KeyString<T extends string>(key: void): void
export function KeyString<T extends string>(key: Key & T): void
export function KeyString<T extends string>(key: T): Key & T
*/
export function KeyString<T extends string>(key: T): Key & T {
  return <Key & T>(key !== void 0 && key !== null ? key + '' : '');
}

export interface EventValue {
  __id: IdNumber;
  __key: KeyString;
}

export type IDBKey
  = number
  | string
  | Array<number | string | Date>
  | Date;

export type IDBValue
  = IDBKey
  | boolean
  | Object
  | File
  | Blob;
