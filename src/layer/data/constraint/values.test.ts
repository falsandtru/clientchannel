import {isValidName, isValidValue} from './values';

describe('Unit: layers/data/constraint/values', () => {
  describe('isValidNameValue', () => {
    it('empty', () => {
      assert(!isValidName(''));
    });

    it('prefix', () => {
      assert(!isValidName('_v'));
      assert(!isValidName('$v'));
    });

    it('postfix', () => {
      assert(!isValidName('v_'));
      assert(!isValidName('v$'));
    });

    it('symbol', () => {
      assert(!isValidName('_'));
      assert(!isValidName('$'));
    });

    it('constant', () => {
      assert(!isValidName('V'));
      assert(!isValidName('VAL'));
    });

    it('valid', () => {
      assert(isValidName('v'));
      assert(isValidName('value'));
      assert(isValidName('Value'));
      assert(isValidName('vAlUe'));
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
      assert(isValidValue(dao)('undefined') === true);
    });

    it('invalid boolean', () => {
      assert(isValidValue(dao)('boolean') === true);
    });

    it('invalid number', () => {
      assert(isValidValue(dao)('number') === true);
    });

    it('invalid string', () => {
      assert(isValidValue(dao)('string') === true);
    });

    it('invalid object', () => {
      assert(isValidValue(dao)('object') === true);
    });

    it('invalid function', () => {
      assert(isValidValue(dao)('function') === false);
    });

  });

});
