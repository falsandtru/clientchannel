import { isStorable } from './value';

describe('Unit: layers/data/constraint/value', () => {
  describe('isStorableValue', () => {
    it('undefined', () => {
      assert(isStorable(<any>void 0) === true);
    });

    it('boolean', () => {
      assert(isStorable(true) === true);
    });

    it('number', () => {
      assert(isStorable(0) === true);
    });

    it('string', () => {
      assert(isStorable('') === true);
    });

    it('object', () => {
      assert(isStorable([]) === true);
      assert(isStorable({}) === true);
      assert(isStorable(<any>null) === true);
      const a: any[] = [];
      a.push(a);
      assert(isStorable(a) === false);
    });

    it('function', () => {
      assert(isStorable(() => 0) === false);
    });

  });

});
