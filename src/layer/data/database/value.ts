export function isStorable(value: IDBValidValue): boolean {
  switch (typeof value) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
      return true;
    case 'object':
      try {
        switch (true) {
          case value === null:
          case value instanceof Int8Array:
          case value instanceof Int16Array:
          case value instanceof Int32Array:
          case value instanceof Uint8Array:
          case value instanceof Uint8ClampedArray:
          case value instanceof Uint16Array:
          case value instanceof Uint32Array:
          case value instanceof ArrayBuffer:
          case value instanceof Blob:
            return true;
          default:
            return Object.keys(value)
              .map(key => value[key])
              .every(isStorable);
        }
      }
      catch (_) {
        return false;
      }
    default:
      return false;
  }
}
