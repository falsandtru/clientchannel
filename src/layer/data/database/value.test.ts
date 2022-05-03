import { isValidPropertyName, isValidPropertyValue, hasBinary } from './value';
import { extend } from 'spica/assign';

describe('Unit: layers/data/database/value', () => {
  describe('isValidPropertyName', () => {
    it('empty', () => {
      assert(!isValidPropertyName(''));
    });

    it('prefix', () => {
      assert(!isValidPropertyName('_v'));
      assert(!isValidPropertyName('$v'));
    });

    it('postfix', () => {
      assert(!isValidPropertyName('v_'));
      assert(!isValidPropertyName('v$'));
    });

    it('symbol', () => {
      assert(!isValidPropertyName('_'));
      assert(!isValidPropertyName('$'));
    });

    it('constant', () => {
      assert(!isValidPropertyName('V'));
      assert(!isValidPropertyName('VAL'));
      assert(!isValidPropertyName('Value'));
    });

    it('valid', () => {
      assert(isValidPropertyName('v'));
      assert(isValidPropertyName('value'));
      assert(isValidPropertyName('vAlUe'));
    });

  });

  describe('isValidPropertyValue', () => {
    it('undefined', () => {
      assert(isValidPropertyValue(undefined as any) === true);
    });

    it('boolean', () => {
      assert(isValidPropertyValue(false) === true);
    });

    it('number', () => {
      assert(isValidPropertyValue(0) === true);
    });

    it('string', () => {
      assert(isValidPropertyValue('') === true);
    });

    it('object', () => {
      assert(isValidPropertyValue([]) === true);
      assert(isValidPropertyValue(null as any) === true);
      assert(isValidPropertyValue({}) === true);
      assert(isValidPropertyValue(new Date()) === true);
      const a: any[] = [];
      a.push(a);
      assert(isValidPropertyValue(a) === false);
    });

    it('function', () => {
      assert(isValidPropertyValue(() => 0) === false);
    });

  });

  describe('hasBinary', () => {
    it('true', () => {
      assert(hasBinary(new ArrayBuffer(0)) === true);
      assert(hasBinary([new ArrayBuffer(0)]) === true);
      assert(hasBinary({ b: new ArrayBuffer(0) }) === true);
      assert(hasBinary(extend(Object.create(null), { b: new ArrayBuffer(0) })) === true);
    });

    it('false', () => {
      assert(hasBinary(undefined as any) === false);
      assert(hasBinary(false) === false);
      assert(hasBinary(0) === false);
      assert(hasBinary('') === false);
      assert(hasBinary([]) === false);
      assert(hasBinary(null as any) === false);
      assert(hasBinary({}) === false);
      assert(hasBinary(Object.create(null)) === false);
      assert(hasBinary(() => 0) === false);
    });

  });

});
