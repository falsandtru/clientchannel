import { ObjectValues } from 'spica/alias';
import { isPrimitive } from 'spica/type';

export type Prop<O, K extends keyof O = keyof O> = K extends PropName<keyof O & string> ? [PropValue<O[K]>] extends [never] ? never : K : never;
type PropName<K> = K extends string ? K extends '' | `${'_' | '$'}${string}` | `${string}${'_' | '$'}` ? never : K : never;
type PropValue<V> = V extends bigint | symbol | ((..._: unknown[]) => void) ? never : V;

export function isStorable(value: IDBValidValue): boolean {
  switch (typeof value) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
      return true;
    case 'object':
      try {
        return value === null
            || isBinary(value)
            || ObjectValues(value).every(value => isStorable(value));
      }
      catch {
        return false;
      }
    default:
      return false;
  }
}

export function hasBinary(value: IDBValidValue): boolean {
  return !isPrimitive(value)
    ? isBinary(value) ||
      ObjectValues(value).some(value => hasBinary(value))
    : false;
}

function isBinary(value: IDBValidValue): boolean {
  return value instanceof Int8Array
      || value instanceof Int16Array
      || value instanceof Int32Array
      || value instanceof Uint8Array
      || value instanceof Uint8ClampedArray
      || value instanceof Uint16Array
      || value instanceof Uint32Array
      || value instanceof ArrayBuffer
      || value instanceof Blob;
}
