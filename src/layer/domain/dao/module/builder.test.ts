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
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const dao = build(source, factory);

      assert(dao[DAO.key] === 'test');
      assert(dao.name === 'test');
      assert(dao.n === 0);
      assert(dao.m === 1);
      assert(dao.p_ === 0);
      assert(dao.p === 0);
    });

    it('seal', () => {
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const dao = build(source, factory);

      try {
        // @ts-expect-error
        delete dao.n;
        throw 0;
      }
      catch (e) {
        assert(e instanceof Error);
      }
    });

    it('id', () => {
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const dao = build(source, factory);

      assert(dao[DAO.id] === undefined);

      try {
        dao[DAO.id] = 0;
        throw 0;
      }
      catch (e) {
        assert(e instanceof Error);
      }
    });

    it('key', () => {
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const dao = build(source, factory);

      assert(dao.name === 'test');

      try {
        dao.name = '';
        throw 0;
      }
      catch (e) {
        assert(e instanceof Error);
      }
    });

    it('prop', () => {
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const dao = build(source, factory);

      dao.n = 2;
      dao.m = 3;
      assert(dao.n === 2);
      assert(dao.m === 3);
      assert(source.n === 2);
      assert(source.m === 3);

      source.n = 4;
      source.m = 5;
      assert(dao.n === 4);
      assert(dao.m === 5);
      assert(source.n === 4);
      assert(source.m === 5);
    });

    it('accessor', () => {
      const source = {[DAO.key]: 'test', m: 1} as any as Value;
      const dao = build(source, factory);

      dao.p_ = 6;
      assert(dao.p_ === 6);
      assert(dao.p === 6);
      assert(source.p_ === undefined);
      assert(source.p === undefined);

      source.p_ = 7;
      assert(dao.p_ === 6);
      assert(dao.p === 6);
      assert(source.p_ === 7);
      assert(source.p === undefined);

      dao.p = 8;
      assert(dao.p === 8);
      assert(dao.p_ === 8);
      assert(source.p_ === 7);
      assert(source.p === undefined);

      source.p = 9;
      assert(dao.p === 8);
      assert(dao.p_ === 8);
      assert(source.p_ === 7);
      assert(source.p === 9);
    });

    it('invalid values', () => {
      const source = {[DAO.key]: 'test', m: 1} as any;
      const dao = build(source, factory);

      // function
      assert.throws(() => dao.m = Date as any);
      // circular reference
      const a: any[] = [];
      a.push(a);
      assert.throws(() => dao.m = a as any);
    });

  });

});
