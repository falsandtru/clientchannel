import { isStorable, hasBinary } from './value';

describe('Unit: layers/data/database/value', () => {
  describe('isStorableValue', () => {
    it('undefined', () => {
      assert(isStorable(void 0 as any) === true);
    });

    it('boolean', () => {
      assert(isStorable(false) === true);
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
      assert(isStorable(null as any) === true);
      const a: any[] = [];
      a.push(a);
      assert(isStorable(a) === false);
    });

    it('function', () => {
      assert(isStorable(() => 0) === false);
    });

  });

  describe('hasBinary', () => {
    it('true', () => {
      assert(hasBinary(new ArrayBuffer(0)) === true);
      assert(hasBinary([new ArrayBuffer(0)]) === true);
      assert(hasBinary({ b: new ArrayBuffer(0) }) === true);
    });

    it('false', () => {
      assert(hasBinary(void 0 as any) === false);
      assert(hasBinary(false) === false);
      assert(hasBinary(0) === false);
      assert(hasBinary('') === false);
      assert(hasBinary([]) === false);
      assert(hasBinary({}) === false);
      assert(hasBinary(null as any) === false);
      assert(hasBinary(() => 0) === false);
    });

  });

});
