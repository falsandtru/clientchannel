import { Object } from 'spica/global';
import { isPrimitive } from 'spica/type';

export type Prop<O, K extends keyof O = keyof O> = K extends PropName<keyof O & string> ? [PropValue<O[K]>] extends [never] ? never : K : never;
type PropName<K> = K extends string ? K extends '' | `${'_' | '$'}${string}` | `${string}${'_' | '$'}` ? never : K : never;
type PropValue<V> = V extends bigint | symbol | ((..._: unknown[]) => void) ? never : V;

export function isValidProperty([name, value]: [string, unknown]): boolean {
  return isValidPropertyName(name)
      && isValidPropertyValue(value);
}
export function isValidPropertyName(name: string): boolean {
  return /^(?=[a-z])[0-9a-zA-Z_]*[0-9a-zA-Z]$/.test(name);
}
export function isValidPropertyValue(value: unknown): boolean {
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
            || Object.entries(value).every(isValidProperty);
      }
      catch {
        return false;
      }
    default:
      return false;
  }
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

export function hasBinary(value: IDBValidValue): boolean {
  return !isPrimitive(value)
    ? isBinary(value) || Object.values(value).some(hasBinary)
    : false;
}
