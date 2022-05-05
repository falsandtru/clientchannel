import { DAO, build } from './builder';

describe('Unit: layers/domain/dao/module/build', () => {
  describe('build', () => {
    class Value {
      n = 0;
      m = 0;
      p_ = 0;
      get p(): number {
        return this.p_;
      }
      set p(v) {
        this.p_ = v;
      }
      get name(): string {
        return this[DAO.key]
      }
      set name(name) {
        this[DAO.key] = name;
      }
    }

    function factory() {
      return new Value();
    }

    it('init', () => {
      const source = { [DAO.key]: 'test', m: 1 } as any as Value;
      const object = build(source, factory());

      assert(object instanceof Value);
      assert(object[DAO.key] === 'test');
      assert(object.name === 'test');
      assert(object.n === 0);
      assert(object.m === 1);
      assert(object.p_ === 0);
      assert(object.p === 0);
    });

    it('seal', () => {
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const target = build(source, factory());

      try {
        // @ts-expect-error
        delete target.n;
        throw 1;
      }
      catch (e) {
        assert(e instanceof Error);
      }
    });

    it('id', () => {
      const source = { [DAO.key]: 'test', m: 1 } as any as Value;
      const object = build(source, factory());

      assert(object[DAO.id] === undefined);
      source[DAO.id] = 1;
      assert(object[DAO.id] === 1);

      try {
        object[DAO.id] = 0;
        throw 1;
      }
      catch (e) {
        assert(e instanceof Error);
      }

      assert(object[DAO.id] === 1);
    });

    it('key', () => {
      const source = { [DAO.key]: 'test', m: 1 } as any as Value;
      const object = build(source, factory());

      assert(object.name === 'test');

      try {
        object.name = '';
        throw 1;
      }
      catch (e) {
        assert(e instanceof Error);
      }

      assert(object.name === 'test');
    });

    it('prop', () => {
      const source = { [DAO.key]: 'test', m: 1 } as any as Value;
      const object = build(source, factory());

      object.n = 2;
      object.m = 3;
      assert(object.n === 2);
      assert(object.m === 3);
      assert(source.n === 2);
      assert(source.m === 3);

      source.n = 4;
      source.m = 5;
      assert(object.n === 4);
      assert(object.m === 5);
      assert(source.n === 4);
      assert(source.m === 5);
    });

    it('accessor', () => {
      const source = { [DAO.key]: 'test', m: 1 } as any as Value;
      const object = build(source, factory());

      object.p_ = 6;
      assert(object.p_ === 6);
      assert(object.p === 6);
      assert(source.p_ === undefined);
      assert(source.p === undefined);

      source.p_ = 7;
      assert(object.p_ === 6);
      assert(object.p === 6);
      assert(source.p_ === 7);
      assert(source.p === undefined);

      object.p = 8;
      assert(object.p === 8);
      assert(object.p_ === 8);
      assert(source.p_ === 7);
      assert(source.p === undefined);

      source.p = 9;
      assert(object.p === 8);
      assert(object.p_ === 8);
      assert(source.p_ === 7);
      assert(source.p === 9);
    });

    it('invalid values', () => {
      const source = { [DAO.key]: 'test', m: 1 } as any;
      const object = build(source, factory());

      // function
      assert.throws(() => object.m = Function as any);
      assert(source.m === 1);
      assert(object.m === 1);
      // circular reference
      const a: any[] = [];
      a.push(a);
      assert.throws(() => object.m = a as any);
      assert(source.m === 1);
      assert(object.m === 1);
    });

  });

});
