import 'jest-graphviz';
import { DotBase, GraphvizObject } from '../../../common';
import { Edge } from '../../Edge';
import { Node } from '../../Node';
import { Cluster, RootCluster } from '../Cluster';
import { Graph } from '../Graph';

describe('class Graph', () => {
  let g: Graph;
  beforeEach(() => {
    g = new Graph();
  });

  it('should be instance of Graph/RootCluster/Cluster/DotBase/GraphvizObject', () => {
    expect(g).toBeInstanceOf(Graph);
    expect(g).toBeInstanceOf(RootCluster);
    expect(g).toBeInstanceOf(Cluster);
    expect(g).toBeInstanceOf(DotBase);
    expect(g).toBeInstanceOf(GraphvizObject);
  });

  describe('renders correctly by toDot method', () => {
    it('simple g', () => {
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('should be escaped if id contains a newline character', () => {
      g = new Graph('1\n2\n');
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('should be escaped if id contains a comma', () => {
      g = new Graph('1"2"');
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('has some attributes', () => {
      g.attributes.edge.set('label', 'edge label');
      g.attributes.graph.set('color', 'red');
      g.attributes.node.set('xlabel', 'node xlabel');
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('nodes and edge', () => {
      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge(node1, node2);
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('subgraphs', () => {
      const subgraphA = g.createSubgraph('A');
      const nodeA1 = subgraphA.createNode('A_node1');
      const nodeA2 = subgraphA.createNode('A_node2');
      subgraphA.createEdge(nodeA1, nodeA2);

      const subgraphB = g.createSubgraph('B');
      const nodeB1 = subgraphB.createNode('B_node1');
      const nodeB2 = subgraphB.createNode('B_node2');
      subgraphA.createEdge(nodeB1, nodeB2);

      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge(node1, node2);
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('subgraphs, depth 2', () => {
      const subgraphDepth1 = g.createSubgraph('depth1');
      const nodeA1 = subgraphDepth1.createNode('depth1_node1');
      const nodeA2 = subgraphDepth1.createNode('depth1_node2');
      subgraphDepth1.createEdge(nodeA1, nodeA2);

      const subgraphDepth2 = subgraphDepth1.createSubgraph('depth2');
      const nodeB1 = subgraphDepth2.createNode('depth2_node1');
      const nodeB2 = subgraphDepth2.createNode('depth2_node2');
      subgraphDepth2.createEdge(nodeB1, nodeB2);

      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge(node1, node2);
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    describe('label attribute behavior', () => {
      it('plain text label to be quoted by double quotation', () => {
        g.attributes.graph.set('label', 'this is test for graph label');
        g.attributes.edge.set('label', 'this is test for edge label');
        g.attributes.node.set('label', 'this is test for node label');
        const dot = g.toDot();
        expect(dot).toBeValidDotAndMatchSnapshot();
      });

      it('html like', () => {
        g.attributes.graph.set('label', '<<B>this is test for graph label</B>>');
        g.attributes.edge.set('label', '<<U>this is test for edge label</U>>');
        g.attributes.node.set('label', '<<I>this is test for node label</I>>');
        const dot = g.toDot();
        expect(dot).toBeValidDotAndMatchSnapshot();
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
      const [node1, node2] = ['node1', 'node2'].map(id => g.createNode(id));
      const edge = new Edge({ graphType: 'digraph' }, node1, node2);
      expect(g.existEdge(edge)).toBe(false);
      g.addEdge(edge);
      expect(g.existEdge(edge)).toBe(true);
      g.removeEdge(edge);
      expect(g.existEdge(edge)).toBe(false);
    });

    it('Subgraph operation methods works', () => {
      const sub = g.context.createSubgraph('sub');
      expect(g.existSubgraph(sub)).toBe(false);
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
});
