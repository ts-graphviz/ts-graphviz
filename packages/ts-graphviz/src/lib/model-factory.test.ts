import { Digraph, Graph, registerDefault } from '@ts-graphviz/core';
import { describe, expect, test } from 'vitest';
import { digraph, graph, strict, withContext } from './model-factory.js';
registerDefault();

test('digraph function returns an object of Digraph, and the strict property is false', () => {
  const g = digraph();
  expect(g).toBeInstanceOf(Digraph);
  expect(g.strict).toStrictEqual(false);
});

test('graph function returns an object of Graph, and the strict property is false', () => {
  const g = graph();
  expect(g).toBeInstanceOf(Graph);
  expect(g.strict).toStrictEqual(false);
});

test('strict.digraph function returns an object of Digraph', () => {
  const g = strict.digraph();
  expect(g).toBeInstanceOf(Digraph);
  expect(g.strict).toStrictEqual(true);
});

test('strict.graph function returns an object of Graph', () => {
  const g = strict.graph();
  expect(g).toBeInstanceOf(Graph);
  expect(g.strict).toStrictEqual(true);
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
    expect(g.strict).toStrictEqual(false);
  });

  test('graph function returns an object of TestGraph, and the strict property is false', () => {
    const g = graph();
    expect(g).toBeInstanceOf(TestGraph);
    expect(g.strict).toStrictEqual(false);
  });

  test('strict.digraph function returns an object of TestDigraph', () => {
    const g = strict.digraph();
    expect(g).toBeInstanceOf(TestDigraph);
    expect(g.strict).toStrictEqual(true);
  });

  test('strict.graph function returns an object of TestGraph', () => {
    const g = strict.graph();
    expect(g).toBeInstanceOf(TestGraph);
    expect(g.strict).toStrictEqual(true);
  });
});
