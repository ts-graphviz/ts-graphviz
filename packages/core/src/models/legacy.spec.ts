import { describe, expect, it } from 'vitest';
import { LegacyDigraph, LegacyGraph, LegacySubgraph } from './legacy.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

describe.each([
  ['LegacyDigraph', () => new LegacyDigraph()],
  ['LegacyGraph', () => new LegacyGraph()],
  ['LegacySubgraph', () => new LegacySubgraph('s')],
])('%s', (_, create) => {
  it('holds one node per id: a node added with the id takes its place', () => {
    const g = create();
    const first = new Node('a');
    const b = new Node('b');
    const second = new Node('a');
    g.addNode(first);
    g.addNode(b);
    g.addNode(second);
    expect(g.nodes).toEqual([second, b]);
    expect(g.getNode('a')).toBe(second);
    expect(g.getNode('c')).toBeUndefined();
  });

  it('gives the first subgraph with an id', () => {
    const g = create();
    const first = new Subgraph('t');
    g.addSubgraph(first);
    g.addSubgraph(new Subgraph('t'));
    expect(g.getSubgraph('t')).toBe(first);
    expect(g.getSubgraph('u')).toBeUndefined();
  });
});
