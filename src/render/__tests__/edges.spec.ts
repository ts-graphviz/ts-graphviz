import { Edge } from '../../model/edges';
import { Node } from '../../model/nodes';
import { Digraph, Graph } from '../../model/root-clusters';
import { toDot } from '../to-dot';

describe('Edge rendering', () => {
  let edge: Edge;

  const [node1, node2, node3] = Array(3)
    .fill(true)
    .map((_, i) => new Node(`node${i + 1}`));

  beforeEach(() => {
    edge = new Edge([node1, node2]);
  });

  describe.each([
    [
      'Digraph context',
      {
        root: new Digraph(),
      },
    ],
    [
      'Graph context',
      {
        root: new Graph(),
      },
    ],
  ])('%s', (_, context) => {
    it('simple edge', () => {
      expect(toDot(edge, context)).toMatchSnapshot();
    });

    describe('edge with comment', () => {
      test('single line comment', () => {
        edge.comment = 'this is comment.';
        expect(toDot(edge, context)).toMatchSnapshot();
      });

      test('multi line comment', () => {
        edge.comment = 'this is comment.\nsecond line.';
        expect(toDot(edge, context)).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(toDot(edge, context)).toMatchSnapshot();
    });

    it('3 nodes', () => {
      edge = new Edge([node1, node2, node3]);
      expect(toDot(edge, context)).toMatchSnapshot();
    });

    it('3 nodes, but many args', () => {
      edge = new Edge([node1, node2, node3, node1, node2, node3, node1, node2, node3]);
      expect(toDot(edge, context)).toMatchSnapshot();
    });
  });
});
