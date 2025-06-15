import {
  Digraph,
  Graph,
  type RootGraphModel,
  attribute as _,
  toDot,
} from 'ts-graphviz';
import { beforeEach, describe, expect, it } from 'vitest';

describe.each([
  ['Digraph', () => new Digraph()],
  ['Graph', () => new Graph()],
])('toDot serialization for %s', (graphType, rootClusterFactory) => {
  let g: RootGraphModel;
  beforeEach(() => {
    g = rootClusterFactory();
  });

  describe('Basic graph rendering', () => {
    it('renders an empty graph with default settings', () => {
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders a strict graph when strict=true', () => {
      g.strict = true;
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders graph with custom attributes via set()', () => {
      g.set(_.dpi, 360);
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders graph with attributes via apply()', () => {
      g.apply({
        [_.layout]: 'dot',
        [_.dpi]: 360,
      });
      expect(toDot(g)).toMatchSnapshot();
    });

    describe('Comment support', () => {
      it('includes single-line graph comments in output', () => {
        g.comment = 'this is comment.';
        expect(toDot(g)).toMatchSnapshot();
      });

      it('includes multi-line graph comments in output', () => {
        g.comment = 'this is comment.\nsecond line.';
        expect(toDot(g)).toMatchSnapshot();
      });
    });

    it('renders graph, edge, and node attributes grouped by category', () => {
      g.attributes.edge.set(_.label, 'edge label');
      g.attributes.graph.set(_.color, 'red');
      g.attributes.node.set(_.xlabel, 'node xlabel');
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders simple nodes and an edge', () => {
      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge([node1, node2]);
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders single-level subgraphs with nodes and edges', () => {
      const subgraphA = g.createSubgraph('A');
      const nodeA1 = subgraphA.createNode('A_node1');
      const nodeA2 = subgraphA.createNode('A_node2');
      subgraphA.createEdge([nodeA1, nodeA2]);

      const subgraphB = g.createSubgraph('B');
      const nodeB1 = subgraphB.createNode('B_node1');
      const nodeB2 = subgraphB.createNode('B_node2');
      subgraphA.createEdge([nodeB1, nodeB2]);

      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge([node1, node2]);
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders nested subgraphs to arbitrary depth', () => {
      const subgraphDepth1 = g.createSubgraph('depth1');
      const nodeA1 = subgraphDepth1.createNode('depth1_node1');
      const nodeA2 = subgraphDepth1.createNode('depth1_node2');
      subgraphDepth1.createEdge([nodeA1, nodeA2]);

      const subgraphDepth2 = subgraphDepth1.createSubgraph('depth2');
      const nodeB1 = subgraphDepth2.createNode('depth2_node1');
      const nodeB2 = subgraphDepth2.createNode('depth2_node2');
      subgraphDepth2.createEdge([nodeB1, nodeB2]);

      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge([node1, node2]);
      expect(toDot(g)).toMatchSnapshot();
    });

    describe('Label attribute quoting', () => {
      it('quotes plain-text labels with double quotes', () => {
        g.attributes.graph.set(_.label, 'this is test for graph label');
        g.attributes.edge.set(_.label, 'this is test for edge label');
        g.attributes.node.set(_.label, 'this is test for node label');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('preserves html-like label quotes without additional quoting', () => {
        g.attributes.graph.set(
          _.label,
          '<<B>this is test for graph label</B>>',
        );
        g.attributes.edge.set(_.label, '<<U>this is test for edge label</U>>');
        g.attributes.node.set(_.label, '<<I>this is test for node label</I>>');
        expect(toDot(g)).toMatchSnapshot();
      });
    });
  });
});
