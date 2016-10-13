export type IdNumber = Id & number;
declare class ID {
  private ID;
}
interface Id extends ID {
}

export function IdNumber<T extends number>(id: void): void
export function IdNumber<T extends number>(id: Id & T): void
export function IdNumber<T extends number>(id: T): Id & T
export function IdNumber<T extends number>(id: T): Id & T {
  return <Id & T>+id;
}

export interface EventValue<K extends string> {
  __id: IdNumber;
  __key: K;
}
