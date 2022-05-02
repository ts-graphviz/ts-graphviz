import 'jest-graphviz';
import { IRootCluster, Digraph, Graph, Node, Edge } from '../../../domain';
import { toDot } from '../to-dot';

describe('Edge rendering', () => {
  let edge: Edge;

  const [node1, node2, node3, node4] = [...Array(4)].map((_, i) => new Node(`node${i + 1}`));

  beforeEach(() => {
    edge = new Edge([node1, node2]);
  });

  describe.each([
    ['Digraph context', (): IRootCluster => new Digraph()],
    ['Graph context', (): IRootCluster => new Graph()],
  ])('%s', (_, create) => {
    let root: IRootCluster;
    beforeEach(() => {
      root = create();
      root.addEdge(edge);
    });
    it('simple edge', () => {
      expect(toDot(root)).toBeValidDotAndMatchSnapshot();
    });

    describe('edge with comment', () => {
      test('single line comment', () => {
        edge.comment = 'this is comment.';
        expect(toDot(root)).toBeValidDotAndMatchSnapshot();
      });

      test('multi line comment', () => {
        edge.comment = 'this is comment.\nsecond line.';
        expect(toDot(root)).toBeValidDotAndMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(toDot(root)).toBeValidDotAndMatchSnapshot();
    });

    describe('custom edge', () => {
      beforeEach(() => {
        root = create();
      });

      it('node group', () => {
        edge = new Edge([node1, [node2, node3], node4]);
        root.addEdge(edge);
        expect(toDot(root)).toBeValidDotAndMatchSnapshot();
      });

      it('3 nodes', () => {
        edge = new Edge([node1, node2, node3]);
        root.addEdge(edge);
        expect(toDot(root)).toBeValidDotAndMatchSnapshot();
      });

      it('3 nodes, but many args', () => {
        edge = new Edge([node1, node2, node3, node1, node2, node3, node1, node2, node3]);
        root.addEdge(edge);
        expect(toDot(root)).toBeValidDotAndMatchSnapshot();
      });
    });
  });
});
