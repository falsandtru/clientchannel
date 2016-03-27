import {IdNumber} from './types';

describe('Unit: layers/data/constraint/types', () => {
  describe('spec', () => {
    it('Cast', () => {
      const id: IdNumber = IdNumber(0);
    });

    it('Disallow multiple cast', () => {
      //const id: void = IdNumber(IdNumber(0));
    });

  });

});
