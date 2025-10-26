import {
  attribute as _,
  Digraph,
  Graph,
  type RootGraphModel,
  toDot,
} from 'ts-graphviz';
import { beforeEach, describe, expect, it } from 'vitest';

describe.each([
  ['Digraph', () => new Digraph()],
  ['Graph', () => new Graph()],
])('toDot serialization for %s', (_graphType, rootClusterFactory) => {
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

    describe('Security: DOT injection prevention', () => {
      it('prevents injection via semicolon in node IDs', () => {
        g.createNode('node1"; injected_node [label="owned"]; dummy="');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via edge operator in node IDs', () => {
        g.createNode('node1" -> "malicious');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via brackets and newlines in node IDs', () => {
        g.createNode('node1"\n} malicious { node');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via semicolon in graph IDs', () => {
        const sg = g.createSubgraph('graph1"; malicious_node [label="injected');
        sg.createNode('test');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via attribute values', () => {
        const node = g.createNode('safe_node');
        node.attributes.set(_.label, 'label"; injected_attr="malicious');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via edge IDs', () => {
        const n1 = g.createNode('n1');
        const n2 = g.createNode('n2" } malicious { "n3');
        g.createEdge([n1, n2]);
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection with multiple quotes in node ID', () => {
        g.createNode('""""""');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via port specification', () => {
        g.createNode('node":port1" -> "evil');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via graph comment', () => {
        g.comment = 'comment"; digraph evil { "node"';
        expect(toDot(g)).toMatchSnapshot();
      });

      it('prevents injection via node comment', () => {
        const node = g.createNode('test');
        node.comment = 'comment"; injected_node [label="owned"';
        expect(toDot(g)).toMatchSnapshot();
      });
    });
  });
});
