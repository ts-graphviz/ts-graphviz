import type {
  ReadonlyNodeModel,
  ReadonlyRootGraphModel,
  ReadonlySubgraphModel,
} from 'ts-graphviz';
import { Digraph, dsl, Subgraph, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// The readers take a model's name from `nodeId` / `graphId` / `subgraphId`,
// and from `id` for a model without them.
describe('the readers take the new names', () => {
  it('a graph and a subgraph that give only the new names', () => {
    const graph = new Digraph('G');
    const plain = {
      $$type: 'Graph',
      graphId: 'H',
      directed: true,
      strict: false,
      comments: [],
      getAttribute: () => undefined,
      hasAttribute: () => false,
      getAttributeNames: () => [],
      attributes: graph.attributes,
      nodes: [],
      edges: [],
      subgraphs: [],
      statements: [],
    } as unknown as ReadonlyRootGraphModel;
    expect(toDot(plain)).toContain('digraph "H"');
    const subgraph = {
      ...plain,
      $$type: 'Subgraph',
      graphId: undefined,
      subgraphId: 's',
      isSubgraphCluster: () => false,
    } as unknown as ReadonlySubgraphModel;
    expect(toDot(subgraph)).toContain('subgraph "s"');
  });

  it('a node that gives nodeId', () => {
    const node = {
      $$type: 'Node',
      nodeId: 'a',
      id: 'a',
      getAttribute: () => undefined,
      hasAttribute: () => false,
      getAttributeNames: () => [],
    } as unknown as ReadonlyNodeModel;
    expect(toDot(node)).toContain('"a"');
  });

  it('getSubgraph finds a subgraph by subgraphId', () => {
    class Named extends Subgraph {
      override get subgraphId(): string | undefined {
        return 'named';
      }
    }
    const g = dsl(new Digraph());
    const s = new Named();
    g.addSubgraph(s);
    expect(g.getSubgraph('named')).toBe(dsl(s));
  });
});
