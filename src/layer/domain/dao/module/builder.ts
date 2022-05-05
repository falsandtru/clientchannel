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

export function build<T>(
  source: T & object,
  target: T & object,
  set?: <P extends Prop<T>>(prop: P, newValue: T[P], oldValue: T[P]) => void,
  get?: <P extends Prop<T>>(prop: P, val: T[P]) => void,
): T {
  assert(Object.values(target).every(prop => !(prop in target)));
  if (typeof source[DAO.key] !== 'string') throw new TypeError(`ClientChannel: DAO: Invalid key: ${source[DAO.key]}`);
  const descmap: PropertyDescriptorMap = {
    ...(ObjectEntries(target) as [Prop<T>, T[Prop<T>]][])
      .filter(isValidProperty)
      .reduce<PropertyDescriptorMap>((map, [prop, iniValue]) => {
        assert(target.hasOwnProperty(prop));
        {
          const desc = ObjectGetOwnPropertyDescriptor(target, prop) ?? {};
          if (desc.get || desc.set) return map;
        }
        if (!(prop in source)) {
          source[prop] = iniValue as typeof source[typeof prop];
        }
        map[prop] = {
          enumerable: true,
          get() {
            const value = source[prop];
            get?.(prop, value);
            return value;
          },
          set(newValue) {
            if (!isValidPropertyValue(newValue)) throw new TypeError(`ClientChannel: DAO: Invalid value: ${JSON.stringify(newValue)}`);
            const oldValue = source[prop];
            source[prop] = newValue;
            set?.(prop, newValue, oldValue);
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
  ObjectDefineProperties(target, descmap);
  ObjectSeal(target);
  return target;
}
