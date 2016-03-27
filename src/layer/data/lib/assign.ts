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
        if (isClonable(nextValue)) {
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

  function isClonable(obj: any): boolean {
    return !!obj
        && typeof obj === 'object'
        && !isTypedArray(obj)
        && obj instanceof Blob === false
        && obj instanceof ImageData === false
        && obj instanceof ArrayBuffer === false;

    function isTypedArray(obj: any): boolean {
      return obj instanceof Object
        && obj.constructor['BYTES_PER_ELEMENT'] > 0
        && obj.buffer instanceof ArrayBuffer;
    }
  }
}
