import { RootGraphModel } from '#lib/common';
import { attribute as _ } from './attribute.js';
import { Digraph, Edge, Node, Graph, Subgraph } from './models/index.js';
import { toDot } from './to-dot.js';

describe('toDot function', () => {
  describe.each([
    ['Digraph', () => new Digraph()],
    ['Graph', () => new Graph()],
  ])('%s', (_, rootClusterFactory) => {
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
        g.set('dpi', 360);
        expect(toDot(g)).toMatchSnapshot();
      });

      test('set attributes by apply', () => {
        g.apply({
          layout: 'dot',
          dpi: 360,
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
        g.attributes.edge.set('label', 'edge label');
        g.attributes.graph.set('color', 'red');
        g.attributes.node.set('xlabel', 'node xlabel');
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
          g.attributes.graph.set('label', 'this is test for graph label');
          g.attributes.edge.set('label', 'this is test for edge label');
          g.attributes.node.set('label', 'this is test for node label');
          expect(toDot(g)).toMatchSnapshot();
        });

        it('html like', () => {
          g.attributes.graph.set('label', '<<B>this is test for graph label</B>>');
          g.attributes.edge.set('label', '<<U>this is test for edge label</U>>');
          g.attributes.node.set('label', '<<I>this is test for node label</I>>');
          expect(toDot(g)).toMatchSnapshot();
        });
      });
    });
  });

  test('class base', () => {
    const G = new Digraph();
    const A = new Subgraph('A');
    const node1 = new Node('A_node1', {
      [_.color]: 'red',
    });
    const node2 = new Node('A_node2', {
      [_.color]: 'blue',
    });
    const edge = new Edge([node1, node2], {
      [_.label]: 'Edge Label',
      [_.color]: 'pink',
    });
    G.addSubgraph(A);
    A.addNode(node1);
    A.addNode(node2);
    A.addEdge(edge);
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });
});
