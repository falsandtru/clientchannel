import { isValidPropertyName, isValidPropertyValue } from './event';

describe('Unit: layers/data/es/event', () => {
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
    it('function', () => {
      assert(isValidPropertyValue({ m() { } })('m') === false);
    });

  });

});
