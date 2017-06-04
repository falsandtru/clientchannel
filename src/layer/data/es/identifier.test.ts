import { EventId, makeEventId } from './identifier';

describe('Unit: layers/data/es/identifier', () => {
  describe('EventId', () => {
    it('type', () => {
      const id: EventId = makeEventId(0);
      assert(id === 0);
    });

    it('value', () => {
      assert(makeEventId(0) === 0);
      assert(makeEventId(1) === 1);
      assert.throws(() => makeEventId(-1));
      assert.throws(() => makeEventId(1.1));
      assert.throws(() => makeEventId(NaN));
      assert.throws(() => makeEventId(Infinity));
    });

    it('disallow multiple applying', () => {
      <void>makeEventId(makeEventId(0));
    });

  });

});
