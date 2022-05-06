import { ChannelStore } from './channel';
import { destroy, idbEventStream, IDBEventType } from '../../../infrastructure/indexeddb/api';

describe('Unit: layers/domain/indexeddb/model/channel', function () {
  this.timeout(9 * 1e3);

  describe('spec', () => {
    beforeEach(done => {
      idbEventStream.once(['test', IDBEventType.destroy], () =>
        idbEventStream.once(['test', IDBEventType.disconnect], () => done()));
      destroy('test');
    });

    interface Value extends ChannelStore.Value { }
    class Value {
      constructor(
        public value: number
      ) {
      }
    }

    it('resource', () => {
      const chan = new ChannelStore('test', () => true, Infinity, Infinity);
      assert.throws(() => new ChannelStore('test', () => true, Infinity, Infinity));
      chan.destroy();
    });

    it('recent', async () => {
      const chan = new ChannelStore<string, Value>('test', () => true, Infinity, Infinity);

      assert.deepStrictEqual(await chan.recent(), []);
      await chan.recent();
      chan.add(new ChannelStore.Record('a', new Value(0)));
      await new Promise(resolve => chan.events.save.once(['a', 'value', 'put'], resolve));
      assert.deepStrictEqual(await chan.recent(), ['a']);
      chan.add(new ChannelStore.Record('b', new Value(0)));
      await new Promise(resolve => chan.events.save.once(['b', 'value', 'put'], resolve));
      assert.deepStrictEqual(await chan.recent(), ['b', 'a']);
      chan.destroy();
    });

    it('clean', async () => {
      const chan = new ChannelStore<string, Value>('test', () => true, Infinity, Infinity);

      chan.add(new ChannelStore.Record('a', new Value(0)));
      assert.deepStrictEqual(await chan.recent(), ['a']);
      assert(chan.has('a') === true);
      chan.delete('a');
      chan.add(new ChannelStore.Record('b', new Value(0)));
      await new Promise(resolve => chan.events.save.once(['a', '', 'delete'], resolve));
      assert.deepStrictEqual(await chan.recent(), ['b']);
      assert(chan.has('a') === false);
      assert(chan.has('b') === true);
      chan.delete('b');
      await new Promise(resolve => chan.events.save.once(['b', '', 'delete'], resolve));
      assert.deepStrictEqual(await chan.recent(), []);
      assert(chan.has('a') === false);
      assert(chan.has('b') === false);
      chan.destroy();
    });

    it('age', async () => {
      const chan = new ChannelStore<string, Value>('test', () => true, Infinity, Infinity);

      chan.add(new ChannelStore.Record('a', new Value(0)));
      chan.expire('b', 100);
      chan.add(new ChannelStore.Record('b', new Value(0)));
      chan.add(new ChannelStore.Record('c', new Value(0)));
      await new Promise(resolve => chan.events.save.once(['b', '', 'delete'], resolve));
      assert.deepStrictEqual(await chan.recent(), ['c', 'a']);
      assert(chan.has('a') === true);
      assert(chan.has('b') === false);
      assert(chan.has('c') === true);
      chan.destroy();
    });

    it('size', async () => {
      const chan = new ChannelStore<string, Value>('test', () => true, Infinity, 2);

      chan.add(new ChannelStore.Record('b', new Value(0)));
      for (let until = Date.now() + 1; Date.now() < until;); // Wait
      chan.add(new ChannelStore.Record('a', new Value(0)));
      for (let until = Date.now() + 1; Date.now() < until;); // Wait
      chan.add(new ChannelStore.Record('c', new Value(0)));
      assert(chan.has('b') === true);
      assert(chan.has('a') === true);
      assert(chan.has('c') === true);
      await new Promise(resolve => chan.events.save.once(['b', '', 'delete'], resolve));
      assert(chan.has('b') === false);
      assert.deepStrictEqual(await chan.recent(), ['c', 'a']);
      assert(chan.has('a') === true);
      assert(chan.has('c') === true);
      chan.destroy();
    });

  });

});
