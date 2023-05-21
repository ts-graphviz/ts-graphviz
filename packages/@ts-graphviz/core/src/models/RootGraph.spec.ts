import { describe, beforeEach, it, test, expect } from 'vitest';

import './registerModelContext.js';

import { DotObject } from './DotObject.js';
import { GraphBase } from './GraphBase.js';
import { RootGraph } from './RootGraph.js';

let g: RootGraph;
beforeEach(() => {
  g = new RootGraph();
});

describe('Constructor', () => {
  test('no args', () => {
    g = new RootGraph();
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([]);
    expect(g.strict).toBe(false);
  });

  test('first argument is id', () => {
    g = new RootGraph('foo');
    expect(g.id).toBe('foo');
    expect(g.values).toStrictEqual([]);
    expect(g.strict).toBe(false);
  });

  test('first argument is id, seccond argument is strict, third argument is attribute object', () => {
    g = new RootGraph('foo', true, { label: 'Test label' });
    expect(g.id).toBe('foo');
    expect(g.values).toStrictEqual([['label', 'Test label']]);
    expect(g.strict).toBe(true);
  });

  test('first argument is attribute object', () => {
    g = new RootGraph({ label: 'Test label' });
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([['label', 'Test label']]);
    expect(g.strict).toBe(false);
  });

  test('first argument is strict', () => {
    g = new RootGraph(true);
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([]);
    expect(g.strict).toBe(true);
  });

  test('first argument is strict, seccond is attribute object', () => {
    g = new RootGraph(true, { label: 'Test label' });
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([['label', 'Test label']]);
    expect(g.strict).toBe(true);
  });
});

it('should be instance of GraphBase/DotObject', () => {
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(DotObject);
});
