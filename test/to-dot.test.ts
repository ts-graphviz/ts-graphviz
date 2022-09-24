import { RootGraphModel, Digraph, Graph, attribute as _ } from 'ts-graphviz';
import { toDot } from '#test/utils';

describe.each([
  ['Digraph', () => new Digraph()],
  ['Graph', () => new Graph()],
])('%s', (__, rootClusterFactory) => {
  let g: RootGraphModel;
  beforeEach(() => {
    g = rootClusterFactory();
  });

  describe('renders correctly by toDot method', () => {
    it('simple g', () => {
      expect(toDot(g)).toMatchSnapshot();
    });

    it('strict graph', () => {
      g.strict = true;
      expect(toDot(g)).toMatchSnapshot();
    });

    test('set attributes', () => {
      g.set(_.dpi, 360);
      expect(toDot(g)).toMatchSnapshot();
    });

    test('set attributes by apply', () => {
      g.apply({
        [_.layout]: 'dot',
        [_.dpi]: 360,
      });
      expect(toDot(g)).toMatchSnapshot();
    });

    describe('digraph with comment', () => {
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
      g.attributes.edge.set(_.label, 'edge label');
      g.attributes.graph.set(_.color, 'red');
      g.attributes.node.set(_.xlabel, 'node xlabel');
      expect(toDot(g)).toMatchSnapshot();
    });

    it('nodes and edge', () => {
      const node1 = g.createNode('node1');
      const node2 = g.createNode('node2');
      g.createEdge([node1, node2]);
      expect(toDot(g)).toMatchSnapshot();
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
      expect(toDot(g)).toMatchSnapshot();
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
      expect(toDot(g)).toMatchSnapshot();
    });

    describe('label attribute behavior', () => {
      it('plain text label to be quoted by double quotation', () => {
        g.attributes.graph.set(_.label, 'this is test for graph label');
        g.attributes.edge.set(_.label, 'this is test for edge label');
        g.attributes.node.set(_.label, 'this is test for node label');
        expect(toDot(g)).toMatchSnapshot();
      });

      it('html like', () => {
        g.attributes.graph.set(_.label, '<<B>this is test for graph label</B>>');
        g.attributes.edge.set(_.label, '<<U>this is test for edge label</U>>');
        g.attributes.node.set(_.label, '<<I>this is test for node label</I>>');
        expect(toDot(g)).toMatchSnapshot();
      });
    });
  });
});
