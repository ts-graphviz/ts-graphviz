import 'jest-graphviz';
import { DotBase, GraphvizObject } from '../../abstract';
import { AttributesBase } from '../AttributesBase';
import { Cluster } from '../Cluster';
import { Context } from '../Context';
import { Edge } from '../Edge';
import { Graph } from '../Graph';
import { Node } from '../Node';
import { RootCluster } from '../RootCluster';

describe('class Graph', () => {
  let g: Graph;
  let context: Context;
  beforeEach(() => {
    context = new Context();
    g = new Graph(context);
  });

  it('should be instance of Graph/RootCluster/Cluster/AttributesBase/DotBase/GraphvizObject', () => {
    expect(g).toBeInstanceOf(Graph);
    expect(g).toBeInstanceOf(RootCluster);
    expect(g).toBeInstanceOf(Cluster);
    expect(g).toBeInstanceOf(AttributesBase);
    expect(g).toBeInstanceOf(DotBase);
    expect(g).toBeInstanceOf(GraphvizObject);
  });

  describe('renders correctly by toDot method', () => {
    it('simple g', () => {
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    it('strict graph', () => {
      g.strict = true;
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    test('set attributes', () => {
      g.set('dpi', 360);
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    test('set attributes by apply', () => {
      g.apply({
        layout: 'dot',
        dpi: 360,
      });
      const dot = g.toDot();
      expect(dot).toBeValidDotAndMatchSnapshot();
    });

    describe('graph with comment', () => {
      test('single line comment', () => {
        g.comment = 'this is comment.';
        expect(g.toDot()).toMatchSnapshot();
      });

      test('multi line comment', () => {
        g.comment = 'this is comment.\nsecond line.';
        expect(g.toDot()).toMatchSnapshot();
      });
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
      const edge = new Edge(context, node1, node2);
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
