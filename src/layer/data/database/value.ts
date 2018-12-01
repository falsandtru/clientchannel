import { isObject } from 'spica/type';

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
            || Object.keys(value)
                 .every(key => isStorable(value[key]));
      }
      catch {
        return false;
      }
    default:
      return false;
  }
}

export function hasBinary(value: IDBValidValue): boolean {
  return isObject(value)
    ? isBinary(value) ||
      Object.keys(value)
        .some(key => hasBinary(value[key]))
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
