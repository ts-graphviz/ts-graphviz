import 'jest-graphviz';
import { DotObject, GraphvizObject } from '../abstract';
import { AttributesBase } from '../attributes-base';
import { Cluster } from '../clusters';
import { Edge } from '../edges';
import { Node } from '../nodes';
import { RootCluster, Graph } from '../root-clusters';
import { toDot } from '../../render/to-dot';

describe('class Graph', () => {
  let g: Graph;
  beforeEach(() => {
    g = new Graph();
  });

  it('should be instance of Graph/RootCluster/Cluster/AttributesBase/DotObject/GraphvizObject', () => {
    expect(g).toBeInstanceOf(Graph);
    expect(g).toBeInstanceOf(RootCluster);
    expect(g).toBeInstanceOf(Cluster);
    expect(g).toBeInstanceOf(AttributesBase);
    expect(g).toBeInstanceOf(DotObject);
    expect(g).toBeInstanceOf(GraphvizObject);
  });

  describe('renders correctly by toDot method', () => {
    it('simple g', () => {
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    it('strict graph', () => {
      g.strict = true;
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    test('set attributes', () => {
      g.set('dpi', 360);
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    test('set attributes by apply', () => {
      g.apply({
        layout: 'dot',
        dpi: 360,
      });
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    describe('graph with comment', () => {
      test('single line comment', () => {
        g.comment = 'this is comment.';
        expect(toDot(g)).toMatchSnapshot();
      });

      test('multi line comment', () => {
        g.comment = 'this is comment.\nsecond line.';
        expect(toDot(g)).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      g.attributes.edge.set('label', 'edge label');
      g.attributes.graph.set('color', 'red');
      g.attributes.node.set('xlabel', 'node xlabel');
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    it('nodes and edge', () => {
      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge([node1, node2]);
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    it('subgraphs', () => {
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
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    it('subgraphs, depth 2', () => {
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
      expect(toDot(g)).toBeValidDotAndMatchSnapshot();
    });

    describe('label attribute behavior', () => {
      it('plain text label to be quoted by double quotation', () => {
        g.attributes.graph.set('label', 'this is test for graph label');
        g.attributes.edge.set('label', 'this is test for edge label');
        g.attributes.node.set('label', 'this is test for node label');
        expect(toDot(g)).toBeValidDotAndMatchSnapshot();
      });

      it('html like', () => {
        g.attributes.graph.set('label', '<<B>this is test for graph label</B>>');
        g.attributes.edge.set('label', '<<U>this is test for edge label</U>>');
        g.attributes.node.set('label', '<<I>this is test for node label</I>>');
        expect(toDot(g)).toBeValidDotAndMatchSnapshot();
      });
    });
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
