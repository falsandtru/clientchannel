import { isValidPropertyName, isValidPropertyValue } from '../../../data/es/event';
import { noop } from '../../../../lib/noop';

export {
  isValidPropertyName,
  isValidPropertyValue
};

export namespace Schema {
  export const meta = Symbol.for('meta');
  export const id = Symbol.for('id');
  export const key = Symbol.for('key');
  export const date = Symbol.for('data');
  export const event = Symbol.for('event');
}

export function build<V extends object>(
  source: V,
  factory: () => V,
  set: <K extends Extract<keyof V, string>>(prop: K, newVal: V[K], oldVal: V[K]) => void = noop,
  get: <K extends Extract<keyof V, string>>(prop: K, val: V[K]) => void = noop,
): V {
  const dao = factory();
  for (const prop of Object.values(Schema)) {
    delete dao[prop];
  }
  if (typeof source[Schema.key] !== 'string') throw new TypeError(`ClientChannel: DAO: Invalid key: ${source[Schema.key]}`);
  const descmap: PropertyDescriptorMap = {
    ...(Object.keys(dao) as Extract<keyof typeof dao, string>[])
      .filter(isValidPropertyName)
      .filter(isValidPropertyValue(dao))
      .reduce<PropertyDescriptorMap>((map, prop) => {
        {
          const desc = Object.getOwnPropertyDescriptor(dao, prop)
          if (desc && (desc.get || desc.set)) return map;
        }
        const iniVal = dao[prop];
        if (source[prop] === undefined) {
          source[prop] = iniVal;
        }
        map[prop] = {
          enumerable: true,
          get: () => {
            const val = source[prop] === undefined ? iniVal : source[prop];
            void get(prop, val);
            return val;
          },
          set: newVal => {
            if (!isValidPropertyValue({ [prop]: newVal })(prop)) throw new TypeError(`ClientChannel: DAO: Invalid value: ${JSON.stringify(newVal)}`);
            const oldVal = source[prop];
            source[prop] = newVal === undefined ? iniVal : newVal;
            void set(prop, newVal, oldVal);
          },
        };
        return map;
      }, {}),
    ...{
      [Schema.meta]: {
        configurable: false,
        enumerable: false,
        get: () => source[Schema.meta]
      },
      [Schema.id]: {
        configurable: false,
        enumerable: false,
        get: () => source[Schema.id]
      },
      [Schema.key]: {
        configurable: false,
        enumerable: false,
        get: () => source[Schema.key]
      },
      [Schema.date]: {
        configurable: false,
        enumerable: false,
        get: () => source[Schema.date]
      },
      [Schema.event]: {
        configurable: false,
        enumerable: false,
        get: () => source[Schema.event]
      },
    }
  };
  void Object.defineProperties(dao, descmap);
  void Object.seal(dao);
  return dao;
}
