import { ObjectDefineProperties, ObjectGetOwnPropertyDescriptor, ObjectKeys, ObjectSeal, ObjectValues } from 'spica/alias';
import { ChannelObject } from '../../../../..';
import { isValidPropertyName, isValidPropertyValue } from '../../../data/es/event';

export {
  isValidPropertyName,
  isValidPropertyValue
};

export namespace Schema {
  export const meta: typeof ChannelObject.meta = Symbol.for('clientchannel/ChannelObject.meta') as any;
  export const id: typeof ChannelObject.id = Symbol.for('clientchannel/ChannelObject.id') as any;
  export const key: typeof ChannelObject.key = Symbol.for('clientchannel/ChannelObject.key') as any;
  export const date: typeof ChannelObject.date = Symbol.for('clientchannel/ChannelObject.data') as any;
  export const event: typeof ChannelObject.event = Symbol.for('clientchannel/ChannelObject.event') as any;
}

export function build<V extends object>(
  source: V,
  factory: () => V,
  set?: <K extends Extract<keyof V, string>>(prop: K, newVal: V[K], oldVal: V[K]) => void,
  get?: <K extends Extract<keyof V, string>>(prop: K, val: V[K]) => void,
): V {
  const dao = factory();
  for (const prop of ObjectValues(Schema)) {
    delete dao[prop];
  }
  if (typeof source[Schema.key] !== 'string') throw new TypeError(`ClientChannel: DAO: Invalid key: ${source[Schema.key]}`);
  const descmap: PropertyDescriptorMap = {
    ...(ObjectKeys(dao) as Extract<keyof typeof dao, string>[])
      .filter(isValidPropertyName)
      .filter(isValidPropertyValue(dao))
      .reduce<PropertyDescriptorMap>((map, prop) => {
        {
          const desc = ObjectGetOwnPropertyDescriptor(dao, prop)
          if (desc && (desc.get || desc.set)) return map;
        }
        const iniVal = dao[prop];
        if (source[prop] === void 0) {
          source[prop] = iniVal;
        }
        map[prop] = {
          enumerable: true,
          get() {
            const val = source[prop] === void 0 ? iniVal : source[prop];
            void get?.(prop, val);
            return val;
          },
          set(newVal) {
            if (!isValidPropertyValue({ [prop]: newVal })(prop)) throw new TypeError(`ClientChannel: DAO: Invalid value: ${JSON.stringify(newVal)}`);
            const oldVal = source[prop];
            source[prop] = newVal === void 0 ? iniVal : newVal;
            void set?.(prop, newVal, oldVal);
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
  void ObjectDefineProperties(dao, descmap);
  void ObjectSeal(dao);
  return dao;
}
