import { test, expect, describe } from 'vitest';
import { strict, digraph, graph, withContext } from './model-factory.js';
import { Digraph, Graph } from '../models/index.js';

test('digraph function returns an object of Digraph, and the strict property is false', () => {
  const g = digraph();
  expect(g).toBeInstanceOf(Digraph);
  expect(g.strict).toBe(false);
});

test('graph function returns an object of Graph, and the strict property is false', () => {
  const g = graph();
  expect(g).toBeInstanceOf(Graph);
  expect(g.strict).toBe(false);
});

test('strict.digraph function returns an object of Digraph', () => {
  const g = strict.digraph();
  expect(g).toBeInstanceOf(Digraph);
  expect(g.strict).toBe(true);
});

test('strict.graph function returns an object of Graph', () => {
  const g = strict.graph();
  expect(g).toBeInstanceOf(Graph);
  expect(g.strict).toBe(true);
});

describe('withContext function allows the class RootGraph to be generated with a custom class.', () => {
  class TestDigraph extends Digraph {}
  class TestGraph extends Graph {}

  const { digraph, graph, strict } = withContext({
    Digraph: TestDigraph,
    Graph: TestGraph,
  });

  test('digraph function returns an object of TestDigraph, and the strict property is false', () => {
    const g = digraph();
    expect(g).toBeInstanceOf(TestDigraph);
    expect(g.strict).toBe(false);
  });

  test('graph function returns an object of TestGraph, and the strict property is false', () => {
    const g = graph();
    expect(g).toBeInstanceOf(TestGraph);
    expect(g.strict).toBe(false);
  });

  test('strict.digraph function returns an object of TestDigraph', () => {
    const g = strict.digraph();
    expect(g).toBeInstanceOf(TestDigraph);
    expect(g.strict).toBe(true);
  });

  test('strict.graph function returns an object of TestGraph', () => {
    const g = strict.graph();
    expect(g).toBeInstanceOf(TestGraph);
    expect(g.strict).toBe(true);
  });
});
