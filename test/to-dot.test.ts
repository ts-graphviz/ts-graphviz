import { parse } from '@ts-graphviz/ast';
import {
  attribute as _,
  Digraph,
  defaultModelKit,
  fromDot,
  Graph,
  htmlLike,
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
      const node1 = defaultModelKit.createNode('node1');
      g.addNode(node1);
      const node2 = defaultModelKit.createNode('node2');
      g.addNode(node2);
      g.addEdge(defaultModelKit.createEdge([node1, node2]));
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders single-level subgraphs with nodes and edges', () => {
      const subgraphA = defaultModelKit.createSubgraph('A');
      g.addSubgraph(subgraphA);
      const nodeA1 = defaultModelKit.createNode('A_node1');
      subgraphA.addNode(nodeA1);
      const nodeA2 = defaultModelKit.createNode('A_node2');
      subgraphA.addNode(nodeA2);
      subgraphA.addEdge(defaultModelKit.createEdge([nodeA1, nodeA2]));

      const subgraphB = defaultModelKit.createSubgraph('B');
      g.addSubgraph(subgraphB);
      const nodeB1 = defaultModelKit.createNode('B_node1');
      subgraphB.addNode(nodeB1);
      const nodeB2 = defaultModelKit.createNode('B_node2');
      subgraphB.addNode(nodeB2);
      subgraphA.addEdge(defaultModelKit.createEdge([nodeB1, nodeB2]));

      const node1 = defaultModelKit.createNode('node1');
      g.addNode(node1);
      const node2 = defaultModelKit.createNode('node2');
      g.addNode(node2);
      g.addEdge(defaultModelKit.createEdge([node1, node2]));
      expect(toDot(g)).toMatchSnapshot();
    });

    it('renders nested subgraphs to arbitrary depth', () => {
      const subgraphDepth1 = defaultModelKit.createSubgraph('depth1');
      g.addSubgraph(subgraphDepth1);
      const nodeA1 = defaultModelKit.createNode('depth1_node1');
      subgraphDepth1.addNode(nodeA1);
      const nodeA2 = defaultModelKit.createNode('depth1_node2');
      subgraphDepth1.addNode(nodeA2);
      subgraphDepth1.addEdge(defaultModelKit.createEdge([nodeA1, nodeA2]));

      const subgraphDepth2 = defaultModelKit.createSubgraph('depth2');
      subgraphDepth1.addSubgraph(subgraphDepth2);
      const nodeB1 = defaultModelKit.createNode('depth2_node1');
      subgraphDepth2.addNode(nodeB1);
      const nodeB2 = defaultModelKit.createNode('depth2_node2');
      subgraphDepth2.addNode(nodeB2);
      subgraphDepth2.addEdge(defaultModelKit.createEdge([nodeB1, nodeB2]));

      const node1 = defaultModelKit.createNode('node1');
      g.addNode(node1);
      const node2 = defaultModelKit.createNode('node2');
      g.addNode(node2);
      g.addEdge(defaultModelKit.createEdge([node1, node2]));
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
          htmlLike('<B>this is test for graph label</B>'),
        );
        g.attributes.edge.set(
          _.label,
          htmlLike('<U>this is test for edge label</U>'),
        );
        g.attributes.node.set(
          _.label,
          htmlLike('<I>this is test for node label</I>'),
        );
        expect(toDot(g)).toMatchSnapshot();
      });
    });

    describe('Security: DOT injection prevention', { tags: ['SM-2'] }, () => {
      /**
       * Writes `model` with toDot and reads it back, as a model and as an
       * AST, so a test can check that the written text holds exactly the
       * statements of `model`: one graph, whose statements (comments aside)
       * are the ones `model` declares.
       */
      function readBack(model: RootGraphModel) {
        const dot = toDot(model);
        const graphs = parse(dot).children.filter((c) => c.type === 'Graph');
        expect(graphs).toHaveLength(1);
        const statements = graphs[0].children.filter(
          (c) => c.type !== 'Comment',
        );
        return { back: fromDot(dot), statements };
      }

      it('prevents injection via semicolon in node IDs', () => {
        const id = 'node1"; injected_node [label="owned"]; dummy="';
        g.addNode(defaultModelKit.createNode(id));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual([id]);
        expect(back.nodes[0].attributes.size).toBe(0);
      });

      it('prevents injection via edge operator in node IDs', () => {
        const id = 'node1" -> "malicious';
        g.addNode(defaultModelKit.createNode(id));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual([id]);
        expect(back.edges).toHaveLength(0);
      });

      it('prevents graph termination injection via quotes and newlines', () => {
        const id = 'node1"\n} malicious { node';
        g.addNode(defaultModelKit.createNode(id));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual([id]);
        expect(back.subgraphs).toHaveLength(0);
      });

      it('prevents statement injection in subgraph IDs', () => {
        const id = 'graph1"; malicious_node [label="injected';
        const sg = defaultModelKit.createSubgraph(id);
        g.addSubgraph(sg);
        sg.addNode(defaultModelKit.createNode('test'));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(statements[0]).toMatchObject({ type: 'Subgraph' });
        expect(
          'children' in statements[0] ? statements[0].children : [],
        ).toMatchObject([{ type: 'Node', id: { value: 'test' } }]);
        expect(back.nodes).toHaveLength(0);
        expect(back.subgraphs.map((s) => s.id)).toEqual([id]);
        expect(back.subgraphs[0].nodes.map((n) => n.id)).toEqual(['test']);
      });

      it('prevents injection via attribute values', () => {
        const label = 'label"; injected_attr="malicious';
        const node = defaultModelKit.createNode('safe_node');
        g.addNode(node);
        node.attributes.set(_.label, label);
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual(['safe_node']);
        expect(back.nodes[0].attributes.size).toBe(1);
        expect(back.nodes[0].attributes.get(_.label)).toBe(label);
      });

      it('prevents injection via edge IDs', () => {
        const id = 'n2" } malicious { "n3';
        const n1 = defaultModelKit.createNode('n1');
        g.addNode(n1);
        const n2 = defaultModelKit.createNode(id);
        g.addNode(n2);
        g.addEdge(defaultModelKit.createEdge([n1, n2]));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(3);
        expect(back.nodes.map((n) => n.id)).toEqual(['n1', id]);
        expect(back.subgraphs).toHaveLength(0);
        expect(back.edges).toHaveLength(1);
        expect(back.edges[0].targets).toMatchObject([{ id: 'n1' }, { id }]);
      });

      it('prevents injection with multiple quotes in node ID', () => {
        const id = '""""""';
        g.addNode(defaultModelKit.createNode(id));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual([id]);
      });

      it('prevents injection via port specification', () => {
        const id = 'node":port1" -> "evil';
        g.addNode(defaultModelKit.createNode(id));
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual([id]);
        expect(back.edges).toHaveLength(0);
      });

      it('prevents injection via graph comment', () => {
        const comment = 'comment"; digraph evil { "node"';
        g.comment = comment;
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(0);
        expect(back.comment).toBe(comment);
        expect(back.nodes).toHaveLength(0);
      });

      it('prevents injection via node comment', () => {
        const comment = 'comment"; injected_node [label="owned"';
        const node = defaultModelKit.createNode('test');
        g.addNode(node);
        node.comment = comment;
        const { back, statements } = readBack(g);
        expect(statements).toHaveLength(1);
        expect(back.nodes.map((n) => n.id)).toEqual(['test']);
        expect(back.nodes[0].comment).toBe(comment);
        expect(back.nodes[0].attributes.size).toBe(0);
      });
    });
  });
});
