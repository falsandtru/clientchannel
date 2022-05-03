import { ObjectDefineProperties, ObjectEntries, ObjectGetOwnPropertyDescriptor, ObjectSeal } from 'spica/alias';
import { Prop, isValidProperty, isValidPropertyValue } from '../../../data/database/value';

export { Prop, isValidProperty, isValidPropertyName, isValidPropertyValue } from '../../../data/database/value';

export namespace DAO {
  export const meta = Symbol.for('clientchannel/DAO.meta');
  export const id = Symbol.for('clientchannel/DAO.id');
  export const key = Symbol.for('clientchannel/DAO.key');
  export const date = Symbol.for('clientchannel/DAO.data');
  export const event = Symbol.for('clientchannel/DAO.event');
}

export function build<T extends object>(
  source: T,
  factory: () => T,
  set?: <P extends Prop<T>>(prop: P, newVal: T[P], oldVal: T[P]) => void,
  get?: <P extends Prop<T>>(prop: P, val: T[P]) => void,
): T {
  const dao = factory();
  assert(Object.values(dao).every(prop => !(prop in dao)));
  if (typeof source[DAO.key] !== 'string') throw new TypeError(`ClientChannel: DAO: Invalid key: ${source[DAO.key]}`);
  const descmap: PropertyDescriptorMap = {
    ...(ObjectEntries(dao) as [Prop<T>, T[Prop<T>]][])
      .filter(isValidProperty)
      .reduce<PropertyDescriptorMap>((map, [prop, value]) => {
        assert(dao.hasOwnProperty(prop));
        {
          const desc = ObjectGetOwnPropertyDescriptor(dao, prop);
          if (desc && (desc.get || desc.set)) return map;
        }
        if (source[prop] === void 0) {
          source[prop] = value;
        }
        map[prop] = {
          enumerable: true,
          get() {
            const val = source[prop] === void 0 ? value : source[prop];
            void get?.(prop, val);
            return val;
          },
          set(newVal) {
            if (!isValidPropertyValue(newVal)) throw new TypeError(`ClientChannel: DAO: Invalid value: ${JSON.stringify(newVal)}`);
            const oldVal = source[prop];
            source[prop] = newVal === void 0 ? value : newVal;
            void set?.(prop, newVal, oldVal);
          },
        };
        return map;
      }, {}),
    ...{
      [DAO.meta]: {
        configurable: false,
        enumerable: false,
        get: () => source[DAO.meta],
      },
      [DAO.id]: {
        configurable: false,
        enumerable: false,
        get: () => source[DAO.id],
      },
      [DAO.key]: {
        configurable: false,
        enumerable: false,
        get: () => source[DAO.key],
      },
      [DAO.date]: {
        configurable: false,
        enumerable: false,
        get: () => source[DAO.date],
      },
      [DAO.event]: {
        configurable: false,
        enumerable: false,
        get: () => source[DAO.event],
      },
    }
  };
  void ObjectDefineProperties(dao, descmap);
  void ObjectSeal(dao);
  return dao;
}
