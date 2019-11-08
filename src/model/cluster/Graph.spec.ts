import { DotBase, GraphvizObject } from '../../common';
import { Cluster, RootCluster } from './Cluster';
import { Graph } from './Graph';

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
      expect(g.toDot()).toMatchSnapshot();
    });

    it('has some attributes', () => {
      g.attributes.edge.set('label', 'edge label');
      g.attributes.graph.set('color', 'red');
      g.attributes.node.set('xlabel', 'node xlabel');
      expect(g.toDot()).toMatchSnapshot();
    });

    it('nodes and edge', () => {
      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge(node1, node2);
      expect(g.toDot()).toMatchSnapshot();
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
      expect(g.toDot()).toMatchSnapshot();
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
      expect(g.toDot()).toMatchSnapshot();
    });
  });
});
