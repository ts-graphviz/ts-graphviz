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

describe('removeAttributeList', () => {
  test('takes a list out of the statements', () => {
    const a = new Node('a');
    g.addNode(a);
    const list = g.addAttributeList('Node', { color: 'red' });
    const other = g.addAttributeList('Edge', { color: 'blue' });
    expect(g.statements).toStrictEqual([a, list, other]);
    g.removeAttributeList(list);
    expect(g.statements).toStrictEqual([a, other]);
    // Taken out once; again, nothing changes.
    g.removeAttributeList(list);
    expect(g.statements).toStrictEqual([a, other]);
  });

  test('empties a leading list, which stays the graph’s', () => {
    const list = g.addAttributeList('Node', { color: 'red' });
    list.addComment('defaults');
    expect(list).toBe(g.attributes.node);
    g.removeAttributeList(list);
    expect(g.attributes.node).toBe(list);
    expect(list.getAttributeNames()).toStrictEqual([]);
    expect(list.comments).toStrictEqual([]);
  });

  test('leaves anything else as it is', () => {
    const a = new Node('a');
    g.addNode(a);
    const list = g.addAttributeList('Node', { color: 'red' });
    const elsewhere = new TestGraph();
    elsewhere.addNode(new Node('b'));
    const foreign = elsewhere.addAttributeList('Node', { color: 'blue' });
    g.removeAttributeList(foreign);
    g.removeAttributeList(a as never);
    expect(g.statements).toStrictEqual([a, list]);
    expect(foreign.getAttribute('color')).toBe('blue');
    expect(g.getNodes()).toStrictEqual([a]);
  });
});

describe('getNodes, getEdges and getSubgraphs', () => {
  test('without an id give everything, in order, as a new array', () => {
    const a = new Node('a');
    const b = new Node('b');
    const again = new Node('a');
    const edge = new Edge([a, b]);
    const s = new Subgraph('s');
    const t = new Subgraph('t');
    g.addNode(a);
    g.addSubgraph(s);
    g.addEdge(edge);
    g.addNode(b);
    g.addNode(again);
    g.addSubgraph(t);
    expect(g.getNodes()).toEqual([a, b, again]);
    expect(g.getEdges()).toEqual([edge]);
    expect(g.getSubgraphs()).toEqual([s, t]);
    expect(g.getNodes()).not.toBe(g.getNodes());
    g.getNodes().pop();
    expect(g.getNodes()).toHaveLength(3);
  });

  test('with an id give the declarations with it', () => {
    const a = new Node('a');
    const again = new Node('a');
    g.addNode(a);
    g.addNode(new Node('b'));
    g.addNode(again);
    expect(g.getNodes('a')).toEqual([a, again]);
    expect(g.getNodes('c')).toEqual([]);
  });

  test('given undefined, look for that id and find none', () => {
    g.addNode(new Node('a'));
    g.addSubgraph(new Subgraph('s'));
    expect(g.getNodes(undefined as unknown as string)).toEqual([]);
    expect(g.getSubgraphs(undefined as unknown as string)).toEqual([]);
  });
});
