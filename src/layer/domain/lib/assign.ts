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
        if (!nextValue || typeof nextValue !== 'object') {
          to[nextKey] = nextValue;
          continue;
        }
        if (Array.isArray(nextValue)) {
          to[nextKey] = nextValue.slice();
          continue;
        }
        if (nextValue instanceof Blob || nextValue instanceof ImageData) {
          to[nextKey] = nextValue;
          continue;
        }
        if (prevValue && nextValue && typeof prevValue === 'object' && !Array.isArray(prevValue)) {
          to[nextKey] = assign(prevValue, nextValue);
          continue;
        }
        to[nextKey] = assign({}, nextValue);
      }
    }
  }
  return to;
}
