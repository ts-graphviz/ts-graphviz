import 'jest-graphviz';
import { DotObject, GraphvizObject } from '../abstract';
import { AttributesBase } from '../attributes-base';
import { Cluster } from '../clusters';
import { Edge } from '../edges';
import { Node } from '../nodes';
import { RootCluster, Digraph, Graph } from '../root-clusters';

describe('RootClusters', () => {
  describe.each([
    ['Digraph', (): RootCluster => new Digraph()],
    ['Graph', (): RootCluster => new Graph()],
  ])('%s', (_, rootClusterFactory) => {
    let g: RootCluster;
    beforeEach(() => {
      g = rootClusterFactory();
    });

    it(`should be instance of RootCluster/Cluster/AttributesBase/DotObject/GraphvizObject`, () => {
      expect(g).toBeInstanceOf(RootCluster);
      expect(g).toBeInstanceOf(Cluster);
      expect(g).toBeInstanceOf(AttributesBase);
      expect(g).toBeInstanceOf(DotObject);
      expect(g).toBeInstanceOf(GraphvizObject);
    });

    describe('addXxx existXxx removeXxx APIs', () => {
      it('Node operation methods works', () => {
        const id = 'node';
        expect(g.existNode(id)).toBe(false);
        const node = new Node(id);
        g.addNode(node);
        expect(g.existNode(id)).toBe(true);
        g.removeNode(node);
        expect(g.existNode(id)).toBe(false);
        g.addNode(node);
        expect(g.existNode(id)).toBe(true);
        g.removeNode(node.id);
        expect(g.existNode(id)).toBe(false);
      });

      it('Edge operation methods works', () => {
        const nodes = ['node1', 'node2'].map((id) => g.createNode(id));
        const edge = new Edge(nodes);
        expect(g.existEdge(edge)).toBe(false);
        g.addEdge(edge);
        expect(g.existEdge(edge)).toBe(true);
        g.removeEdge(edge);
        expect(g.existEdge(edge)).toBe(false);
      });

      it('Subgraph operation methods works', () => {
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
  });
});
