import type { NodeModel } from '@ts-graphviz/common';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { Edge } from './Edge.js';
import { GraphBase } from './GraphBase.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

class TestGraph extends GraphBase<'Graph', any> {
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
    const nodes: [NodeModel, NodeModel] = [new Node('foo'), new Node('bar')];
    const edge = new Edge(nodes);
    expect(g.existEdge(edge)).toBe(false);
    g.addEdge(edge);
    expect(g.existEdge(edge)).toBe(true);
    g.removeEdge(edge);
    expect(g.existEdge(edge)).toBe(false);
  });

  test('Subgraph operation methods works', () => {
    const sub = new Subgraph('sub');
    g.addSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(true);
    g.removeSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(false);
    g.addSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(true);
    g.removeSubgraph(sub);
    expect(g.existSubgraph(sub)).toBe(false);
  });
});
