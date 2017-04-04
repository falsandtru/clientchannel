const RegValidValueNameFormat = /^[a-zA-Z][0-9a-zA-Z_]*$/;
const RegInvalidValueNameFormat = /^[0-9A-Z_]+$/;

export function isValidPropertyName(prop: string): boolean {
  return prop.length > 0
      && prop[0] !== '_'
      && prop[prop.length - 1] !== '_'
      && !RegInvalidValueNameFormat.test(prop)
      && RegValidValueNameFormat.test(prop);
}

export function isValidPropertyValue(dao: any) {
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
