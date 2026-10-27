import type { EdgeTargetTuple } from '@ts-graphviz/common';
import { Digraph, Edge, Graph, Node } from '@ts-graphviz/core';

import { describe, expect, test } from 'vitest';
import { digraph, graph, strict, withContext } from './model-factory.js';
import { toDot } from './to-dot.js';

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

test('withContext builds with subclasses that set their own id and attributes, printed like the core classes', () => {
  class MyDigraph extends Digraph {
    constructor() {
      super('G', { label: 'Custom Digraph' });
    }
  }
  class MyNode extends Node {
    constructor(id: string) {
      super(`node_${id}`, { label: `Custom Node ${id}` });
    }
  }
  class MyEdge extends Edge {
    constructor(targets: EdgeTargetTuple) {
      super(targets, { label: 'Custom Edge' });
    }
  }
  const { digraph } = withContext({
    Digraph: MyDigraph,
    Node: MyNode,
    Edge: MyEdge,
  });
  const g = digraph((g) => {
    const a = g.node('A');
    const b = g.node('B');
    expect(a).toBeInstanceOf(MyNode);
    expect(g.edge([a, b])).toBeInstanceOf(MyEdge);
  });
  expect(g).toBeInstanceOf(MyDigraph);
  expect(toDot(g)).toBe(
    [
      'digraph "G" {',
      '  label = "Custom Digraph";',
      '  "node_A" [',
      '    label = "Custom Node A";',
      '  ];',
      '  "node_B" [',
      '    label = "Custom Node B";',
      '  ];',
      '  "node_A" -> "node_B" [',
      '    label = "Custom Edge";',
      '  ];',
      '}',
    ].join('\n'),
  );
});
