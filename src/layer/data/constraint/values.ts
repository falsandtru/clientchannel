const RegValidValueNameFormat = /^[A-z][0-9A-z_]*$/;
const RegInvalidValueNameFormat = /^[0-9A-Z_]+$/;

export function isValidName(prop: string): boolean {
  return prop.length > 0
      && prop[0] !== '_'
      && prop[prop.length - 1] !== '_'
      && !RegInvalidValueNameFormat.test(prop)
      && RegValidValueNameFormat.test(prop);
}

export function isValidValue(dao: any) {
  return (prop: string): boolean => {
    switch (typeof dao[prop]) {
      case 'undefined':
      case 'boolean':
      case 'number':
      case 'string':
      case 'object':
        return true;
      default:
        return false;
    }
  }
}
