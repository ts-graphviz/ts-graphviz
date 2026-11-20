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

  test.each([
    [['G', { strict: true }], 'G', true],
    [[undefined, { strict: true }], undefined, true],
    [[{ strict: true }], undefined, true],
    [['G', {}], 'G', false],
    [['G', { strict: false }], 'G', false],
    [['G', null], 'G', false],
  ])('the options after the id: %j', (args, id, strict) => {
    g = new TestRootGraph(...(args as []));
    expect(g.id).toStrictEqual(id);
    expect(g.statements).toStrictEqual([]);
    expect(g.strict).toStrictEqual(strict);
  });

  test('reads nothing of a subclass before it is initialized', () => {
    class Late extends RootGraph {
      #directed = true;
      get directed() {
        return this.#directed;
      }
    }
    expect(new Late('G', { strict: true }).strict).toBe(true);
    expect(() => new Late('G', 'H' as never)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_ARGUMENTS' }),
    );
  });

  test('reads only own properties of the options', () => {
    const options = Object.create({ strict: true });
    expect(new TestRootGraph('G', options).strict).toBe(false);
  });

  test.each([
    ['two ids', ['G', 'H']],
    // 3.x's forms: as in DOT, a graph takes no attributes here.
    ['attributes', ['G', { label: 'x' }]],
    ['attributes before the options', ['G', { label: 'x' }, { strict: true }]],
    ['a strict flag', ['G', true]],
    ['a strict flag first', [true]],
    ['an id after the options', [{ strict: true }, 'G']],
    ['a strict option that is not a boolean', ['G', { strict: 'yes' }]],
    ['a number', [1]],
    ['an array as the options', ['G', []]],
    ['too many arguments', ['G', {}, undefined]],
    ['another option', ['G', { strict: true, directed: true }]],
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
