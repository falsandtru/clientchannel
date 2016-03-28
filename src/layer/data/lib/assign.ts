export function assign<T extends Object>(target: T | {}, ...sources: T[]): T {
  if (target === undefined || target === null) {
    throw new TypeError(`LocalSocket: assign: Cannot merge objects into ${target}.`);
  }

  const to = Object(target);
  for (let i = 0; i < sources.length; i++) {
    let nextSource = sources[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }
    nextSource = Object(nextSource);

    for (let nextKey of Object.keys(Object(nextSource))) {
      let desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        const nextValue = nextSource[nextKey];
        const prevValue = to[nextKey];
        if (isCloneable(nextValue)) {
          to[nextKey] = Array.isArray(nextValue)
            ? nextValue.slice()
            : assign({}, nextValue);
        }
        else {
          to[nextKey] = nextValue;
        }
      }
    }
  }
  return to;

  function isCloneable(obj: any): boolean {
    return !!obj
        && typeof obj === 'object'
        && !isTypedArray(obj)
        && !isBlob(obj)
        && !isImageData(obj)
        && !isArrayBuffer(obj);

    function isTypedArray(obj: any): boolean {
      return obj instanceof Object
          && obj.constructor instanceof Object
          && obj.constructor['BYTES_PER_ELEMENT'] > 0
          && isArrayBuffer(obj.buffer);
    }
    function isBlob(obj: any): boolean {
      return type(obj) === 'Blob';
    }
    function isImageData(obj: any): boolean {
      return type(obj) === 'ImageData';
    }
    function isArrayBuffer(obj: any): boolean {
      return type(obj) === 'ArrayBuffer';
    }
    function type(target: any): string {
      return (<string>Object.prototype.toString.call(obj)).split(' ').pop().slice(0, -1);
    }
  }
}
