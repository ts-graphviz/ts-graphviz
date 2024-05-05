import { beforeEach, describe, expect, it, test } from 'vitest';
import { registerDefault } from '../register-default.js';
import { GraphBase } from './GraphBase.js';
import { RootGraph } from './RootGraph.js';
registerDefault();

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
});

it('should be instance of GraphBase', () => {
  expect(g).toBeInstanceOf(GraphBase);
});

test('$$type propaty should be "Graph"', () => {
  expect(g.$$type).toStrictEqual('Graph');
});
