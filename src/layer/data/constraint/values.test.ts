import { isValidPropertyName, isValidPropertyValue } from './values';

describe('Unit: layers/data/constraint/values', () => {
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
    });

    it('valid', () => {
      assert(isValidPropertyName('v'));
      assert(isValidPropertyName('value'));
      assert(isValidPropertyName('Value'));
      assert(isValidPropertyName('vAlUe'));
    });

  });

  describe('isValidPropertyValue', () => {
    const dao = <any>{
      undefined: void 0,
      boolean: false,
      number: 0,
      string: '',
      object: {},
      function: () => 0
    };

    it('invalid undefined', () => {
      assert(isValidPropertyValue(dao)('undefined') === true);
    });

    it('invalid boolean', () => {
      assert(isValidPropertyValue(dao)('boolean') === true);
    });

    it('invalid number', () => {
      assert(isValidPropertyValue(dao)('number') === true);
    });

    it('invalid string', () => {
      assert(isValidPropertyValue(dao)('string') === true);
    });

    it('invalid object', () => {
      assert(isValidPropertyValue(dao)('object') === true);
    });

    it('invalid function', () => {
      assert(isValidPropertyValue(dao)('function') === false);
    });

  });

});
