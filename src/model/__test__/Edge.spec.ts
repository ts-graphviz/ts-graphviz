import { DotBase, GraphvizObject } from '../../abstract';
import { Context } from '../Context';
import { Digraph } from '../Digraph';
import { Edge } from '../Edge';
import { Graph } from '../Graph';
import { Node } from '../Node';

describe('class Edge', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let g: Graph | Digraph;
  const DigraphContext = new Context();
  g = new Digraph(DigraphContext);
  const GraphContext = new Context();
  g = new Graph(GraphContext);

  let edge: Edge;

  const [node1, node2, node3] = new Array(3).fill(true).map((_, i) => new Node(`node${i + 1}`));
  beforeEach(() => {
    edge = new Edge(DigraphContext, node1, node2);
  });

  it('should be instance of Edge/DotBase/GraphvizObject', () => {
    expect(edge).toBeInstanceOf(Edge);
    expect(edge).toBeInstanceOf(DotBase);
    expect(edge).toBeInstanceOf(GraphvizObject);
  });

  describe('renders correctly by toDot method', () => {
    it('simple edge', () => {
      expect(edge.toDot()).toMatchSnapshot();
    });

    describe('edge with comment', () => {
      test('single line comment', () => {
        edge.comment = 'this is comment.';
        expect(edge.toDot()).toMatchSnapshot();
      });

      test('multi line comment', () => {
        edge.comment = 'this is comment.\nsecond line.';
        expect(edge.toDot()).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(edge.toDot()).toMatchSnapshot();
    });

    it('graphType is "graph"', () => {
      edge = new Edge(GraphContext, node1, node2);
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(edge.toDot()).toMatchSnapshot();
    });

    it('3 nodes', () => {
      edge = new Edge(DigraphContext, node1, node2, node3);
      expect(edge.toDot()).toMatchSnapshot();
    });

    it('3 nodes, but many args', () => {
      edge = new Edge(DigraphContext, node1, node2, node3, node1, node2, node3, node1, node2, node3);
      expect(edge.toDot()).toMatchSnapshot();
    });
  });
});
