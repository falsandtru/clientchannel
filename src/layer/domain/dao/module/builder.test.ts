import {isValidPropertyName, isValidPropertyValue, build} from './builder';

describe('Unit: layers/domain/dao/module/build', () => {
  describe('build', () => {
    class DAO {
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
        return this['__key']
      }
      set name(name) {
        this['__key'] = name;
      }
    }

    function factory() {
      return new DAO();
    }

    it('init', () => {
      const source = <DAO><any>{__key: 'test', m: 1};
      const dao = build(source, factory);

      assert(dao['__key'] === 'test');
      assert(dao.name === 'test');
      assert(dao.n === 0);
      assert(dao.m === 1);
      assert(dao.p_ === 0);
      assert(dao.p === 0);
    });

    it('seal', () => {
      const source = <DAO><any>{__key: 'test', m: 1};
      const dao = build(source, factory);

      try {
        delete dao.n;
        throw 0;
      }
      catch (e) {
        assert(e instanceof Error);
      }
    });

    it('id', () => {
      const source = <DAO><any>{__key: 'test', m: 1};
      const dao = build(source, factory);

      assert(dao['__id'] === void 0);

      try {
        dao['__id'] = 0;
        throw 0;
      }
      catch (e) {
        assert(e instanceof Error);
      }
    });

    it('key', () => {
      const source = <DAO><any>{__key: 'test', m: 1};
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
      const source = <DAO><any>{__key: 'test', m: 1};
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
      const source = <DAO><any>{__key: 'test', m: 1};
      const dao = build(source, factory);

      dao.p_ = 6;
      assert(dao.p_ === 6);
      assert(dao.p === 6);
      assert(source.p_ === void 0);
      assert(source.p === void 0);

      source.p_ = 7;
      assert(dao.p_ === 6);
      assert(dao.p === 6);
      assert(source.p_ === 7);
      assert(source.p === void 0);

      dao.p = 8;
      assert(dao.p === 8);
      assert(dao.p_ === 8);
      assert(source.p_ === 7);
      assert(source.p === void 0);

      source.p = 9;
      assert(dao.p === 8);
      assert(dao.p_ === 8);
      assert(source.p_ === 7);
      assert(source.p === 9);
    });

  });

});
