import { beforeEach, describe, expect, it, test } from 'vitest';

import { GraphBase } from './GraphBase.js';
import { RootGraph } from './RootGraph.js';

class TestRootGraph extends RootGraph {
  public directed = true;
}

let g: RootGraph;
beforeEach(() => {
  g = new TestRootGraph();
});

describe('Constructor', () => {
  test('no args', () => {
    g = new TestRootGraph();
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([]);
    expect(g.strict).toStrictEqual(false);
  });

  test('first argument is id', () => {
    g = new TestRootGraph('foo');
    expect(g.id).toStrictEqual('foo');
    expect(g.values).toStrictEqual([]);
    expect(g.strict).toStrictEqual(false);
  });

  test('first argument is id, seccond argument is strict, third argument is attribute object', () => {
    g = new TestRootGraph('foo', true, { label: 'Test label' });
    expect(g.id).toStrictEqual('foo');
    expect(g.values).toStrictEqual([['label', 'Test label']]);
    expect(g.strict).toStrictEqual(true);
  });

  test('first argument is attribute object', () => {
    g = new TestRootGraph({ label: 'Test label' });
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([['label', 'Test label']]);
    expect(g.strict).toStrictEqual(false);
  });

  test('first argument is strict', () => {
    g = new TestRootGraph(true);
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([]);
    expect(g.strict).toStrictEqual(true);
  });

  test('first argument is strict, seccond is attribute object', () => {
    g = new TestRootGraph(true, { label: 'Test label' });
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([['label', 'Test label']]);
    expect(g.strict).toStrictEqual(true);
  });

  test.each([
    [['G', { label: 'x' }, { strict: true }], 'G', [['label', 'x']], true],
    [['G', undefined, { strict: true }], 'G', [], true],
    [[undefined, undefined, { strict: true }], undefined, [], true],
    [[{ label: 'x' }, { strict: true }], undefined, [['label', 'x']], true],
    [['G', { label: 'x' }, {}], 'G', [['label', 'x']], false],
    [['G', { label: 'x' }, { strict: false }], 'G', [['label', 'x']], false],
    [['G', null, { strict: true }], 'G', [], true],
  ])('options after the attributes: %j', (args, id, values, strict) => {
    g = new TestRootGraph(...(args as []));
    expect(g.id).toStrictEqual(id);
    expect(g.values).toStrictEqual(values);
    expect(g.strict).toStrictEqual(strict);
  });

  test('reads nothing of a subclass before it is initialized', () => {
    class Late extends RootGraph {
      #directed = true;
      get directed() {
        return this.#directed;
      }
    }
    expect(new Late('G', {}, { strict: true }).strict).toBe(true);
    expect(() => new Late('G', 'H' as never)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_ARGUMENTS' }),
    );
  });

  test('reads only own properties of the options', () => {
    const options = Object.create({ strict: true });
    expect(new TestRootGraph('G', {}, options).strict).toBe(false);
  });

  test.each([
    ['two ids', ['G', 'H']],
    ['an id after the attributes', [{ label: 'x' }, 'G']],
    ['a strict flag after the attributes', [{ label: 'x' }, true]],
    ['a strict flag after the options', ['G', {}, {}, true]],
    ['the strict flag and options', ['G', true, {}, { strict: true }]],
    ['a strict option that is not a boolean', ['G', {}, { strict: 'yes' }]],
    ['a number', [1]],
    ['an array as the attributes', ['G', []]],
    ['too many arguments', ['G', {}, {}, undefined]],
    ['attributes in the options', ['G', undefined, { label: 'x' }]],
    ['another option', ['G', {}, { strict: true, directed: true }]],
  ])(
    'throws a TypeError with code TSG_ERR_INVALID_ARGUMENTS for %s',
    (_, args) => {
      expect(() => new TestRootGraph(...(args as []))).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_INVALID_ARGUMENTS',
        }),
      );
    },
  );
});

it('should be instance of GraphBase', () => {
  expect(g).toBeInstanceOf(GraphBase);
});

test('$$type propaty should be "Graph"', () => {
  expect(g.$$type).toStrictEqual('Graph');
});
