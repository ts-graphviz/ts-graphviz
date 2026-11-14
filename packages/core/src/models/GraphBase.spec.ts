import type { NodeModel } from '@ts-graphviz/common';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { Edge } from './Edge.js';
import { GraphBase } from './GraphBase.js';
import { defaultModelKit } from './model-kit.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

class TestGraph extends GraphBase<'Graph', any> {
  protected override defaultModels() {
    return defaultModelKit;
  }
  public get $$type(): 'Graph' {
    return 'Graph';
  }
  public readonly directed = false;
  public strict = true;
}

let g: TestGraph;
beforeEach(() => {
  g = new TestGraph();
});

it('should be instance of GraphBase/AttributesBase', () => {
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(AttributesBase);
});

describe('Constructor', () => {
  test('first argument is attributes object', () => {
    const root = new TestGraph({
      label: 'Label',
    });
    expect(root.size).toBe(1);
    expect(root.get('label')).toBe('Label');
  });
});

describe('Imperative API(addXxx existXxx removeXxx methods)', () => {
  test('Node operation methods works', () => {
    expect(g.existNode('foo')).toBe(false);
    const node = new Node('foo');
    g.addNode(node);
    expect(g.existNode('foo')).toBe(true);
    g.removeNode(node);
    expect(g.existNode('foo')).toBe(false);
    g.addNode(node);
    expect(g.existNode('foo')).toBe(true);
    g.removeNode('foo');
    expect(g.existNode('foo')).toBe(false);
  });

  test('Edge operation methods works', () => {
    const nodes = ['foo', 'bar'].map((id) => g.createNode(id)) as [
      NodeModel,
      NodeModel,
    ];
    const edge = new Edge(nodes);
    expect(g.existEdge(edge)).toBe(false);
    g.addEdge(edge);
    expect(g.existEdge(edge)).toBe(true);
    g.removeEdge(edge);
    expect(g.existEdge(edge)).toBe(false);
  });

  test('Subgraph operation methods works', () => {
    const sub = g.createSubgraph('sub');
    expect(g.existSubgraph(sub)).toBe(true);
    g.removeSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(false);
    g.addSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(true);
    g.removeSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(false);
  });
});

describe('Model classes of a graph', () => {
  class TestNode extends Node {}
  class TestEdge extends Edge {}
  class TestSubgraphA extends Subgraph {}
  class TestSubgraphB extends Subgraph {}
  class TestSubgraphC extends Subgraph {}

  describe('By providing a context in the with method, the object created by createXxx is created with the model given by the context.', () => {
    test('with TestNode', () => {
      g.with({ Node: TestNode });

      const node = g.createNode('hoge');
      expect(node).toBeInstanceOf(TestNode);
    });

    test('with TestEdge', () => {
      g.with({ Edge: TestEdge });

      const edge = g.createEdge(['foo', 'bar']);
      expect(edge).toBeInstanceOf(TestEdge);
    });

    test('with TestSubgraph', () => {
      g.with({ Subgraph: TestSubgraphA });

      const subgraph = g.createSubgraph();
      expect(subgraph).toBeInstanceOf(TestSubgraphA);
    });

    test('In nested contexts, the settings are inherited. It also does not affect the parent context.', () => {
      const sub = g.createSubgraph();
      expect(sub).toBeInstanceOf(Subgraph);

      sub.with({ Subgraph: TestSubgraphA });
      const A = sub.createSubgraph();
      expect(A).toBeInstanceOf(TestSubgraphA);

      A.with({ Subgraph: TestSubgraphB });
      const B = A.createSubgraph();
      expect(B).toBeInstanceOf(TestSubgraphB);

      B.with({ Subgraph: TestSubgraphC });
      const C = B.createSubgraph();
      expect(C).toBeInstanceOf(TestSubgraphC);

      expect(sub.createSubgraph()).toBeInstanceOf(TestSubgraphA);
      expect(A.createSubgraph()).toBeInstanceOf(TestSubgraphB);
      expect(B.createSubgraph()).toBeInstanceOf(TestSubgraphC);
    });
  });
});
