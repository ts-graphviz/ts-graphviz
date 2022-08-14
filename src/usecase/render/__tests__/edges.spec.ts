import { Graph, Node, Edge } from '../../../model/index.js';
import { toDot } from '../to-dot.js';

describe('Edge rendering', () => {
  let edge: Edge;

  const [node1, node2, node3, node4] = [...Array(4)].map((_, i) => new Node(`node${i + 1}`));

  beforeEach(() => {
    edge = new Edge([node1, node2]);
  });

  describe.each([
    ['Digraph context', (): Graph => new Graph(true)],
    ['Graph context', (): Graph => new Graph(false)],
  ])('%s', (_, create) => {
    let root: Graph;
    beforeEach(() => {
      root = create();
      root.addEdge(edge);
    });
    it('simple edge', () => {
      expect(toDot(root)).toMatchSnapshot();
    });

    describe('edge with comment', () => {
      test('single line comment', () => {
        edge.comment = 'this is comment.';
        expect(toDot(root)).toMatchSnapshot();
      });

      test('multi line comment', () => {
        edge.comment = 'this is comment.\nsecond line.';
        expect(toDot(root)).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(toDot(root)).toMatchSnapshot();
    });

    describe('custom edge', () => {
      beforeEach(() => {
        root = create();
      });

      it('node group', () => {
        edge = new Edge([node1, [node2, node3], node4]);
        root.addEdge(edge);
        expect(toDot(root)).toMatchSnapshot();
      });

      it('3 nodes', () => {
        edge = new Edge([node1, node2, node3]);
        root.addEdge(edge);
        expect(toDot(root)).toMatchSnapshot();
      });

      it('3 nodes, but many args', () => {
        edge = new Edge([node1, node2, node3, node1, node2, node3, node1, node2, node3]);
        root.addEdge(edge);
        expect(toDot(root)).toMatchSnapshot();
      });
    });
  });
});
