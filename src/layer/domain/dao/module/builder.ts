import { isValidPropertyName, isValidPropertyValue } from '../../../data/es/event';
import { noop } from '../../../../lib/noop';

export {
  isValidPropertyName,
  isValidPropertyValue
};

export const SCHEMA = {
  META: {
    NAME: '__meta'
  },
  ID: {
    NAME: '__id'
  },
  KEY: {
    NAME: '__key'
  },
  DATE: {
    NAME: '__date'
  },
  EVENT: {
    NAME: '__event'
  }
};

export function build<V extends object>(source: V, factory: () => V, update: (attr: string, newVal: any, oldVal: any) => void = noop): V {
  const dao: V = factory();
  void Object.keys(SCHEMA)
    .map(prop => SCHEMA[prop].NAME)
    .reduce((_, prop) => { delete dao[prop] }, void 0);
  if (typeof source[SCHEMA.KEY.NAME] !== 'string') throw new TypeError(`ClientChannel: Invalid key: ${source[SCHEMA.KEY.NAME]}`);
  const descmap: PropertyDescriptorMap = Object.assign(Object.keys(dao)
    .filter(isValidPropertyName)
    .filter(isValidPropertyValue(dao))
    .reduce<PropertyDescriptorMap>((map, prop) => {
      {
        const desc = Object.getOwnPropertyDescriptor(dao, prop)
        if (desc && (desc.get || desc.set)) return map;
      }
      const iniVal = dao[prop];
      if (source[prop] === void 0) {
        source[prop] = iniVal;
      }
      map[prop] = {
        enumerable: true,
        get: () => source[prop] === void 0 ? iniVal : source[prop],
        set: newVal => {
          if (!isValidPropertyValue({ [prop]: newVal })(prop)) throw new TypeError(`ClientChannel: Invalid value: ${JSON.stringify(newVal)}`);
          const oldVal = source[prop];
          source[prop] = newVal === void 0 ? iniVal : newVal;
          void update(prop, newVal, oldVal);
        }
      };
      return map;
    }, {}), {
      [SCHEMA.META.NAME]: {
        configurable: false,
        enumerable: false,
        get: () => source[SCHEMA.META.NAME]
      },
      [SCHEMA.ID.NAME]: {
        configurable: false,
        enumerable: false,
        get: () => source[SCHEMA.ID.NAME]
      },
      [SCHEMA.KEY.NAME]: {
        configurable: false,
        enumerable: false,
        get: () => source[SCHEMA.KEY.NAME]
      },
      [SCHEMA.DATE.NAME]: {
        configurable: false,
        enumerable: false,
        get: () => source[SCHEMA.DATE.NAME]
      },
      [SCHEMA.EVENT.NAME]: {
        configurable: false,
        enumerable: false,
        get: () => source[SCHEMA.EVENT.NAME]
      }
    });
  void Object.defineProperties(dao, descmap);
  void Object.seal(dao);
  return dao;
}
