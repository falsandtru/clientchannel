export function isStorable(value: IDBValidValue): boolean {
  switch (typeof value) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
      return true;
    case 'object':
      try {
        void JSON.stringify(value);
        return true;
      }
      catch (_) {
        return false;
      }
    default:
      return false;
  }
}
