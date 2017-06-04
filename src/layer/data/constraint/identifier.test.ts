import { Id, makeIdentifier } from './identifier';

describe('Unit: layers/data/constraint/identifier', () => {
  describe('Id', () => {
    it('cast', () => {
      const id: Id & number = makeIdentifier<Id, number>(0);
      assert(id === 0);
    });

  });

});
