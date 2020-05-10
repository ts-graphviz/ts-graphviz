import { DotBase, GraphvizObject } from '../abstract';
import { Edge } from '../edges';
import { Node } from '../nodes';
import { toDot } from '../../render/to-dot';
import { IContext } from '../../types';
import { Digraph, Graph } from '../root-clusters';

describe('class Edge', () => {
  const DigraphContext: IContext = {
    root: new Digraph(),
  };
  const GraphContext: IContext = {
    root: new Graph(),
  };

  let edge: Edge;

  const [node1, node2, node3] = new Array(3).fill(true).map((_, i) => new Node(`node${i + 1}`));
  beforeEach(() => {
    edge = new Edge([node1, node2]);
  });

  it('should be instance of Edge/DotBase/GraphvizObject', () => {
    expect(edge).toBeInstanceOf(Edge);
    expect(edge).toBeInstanceOf(DotBase);
    expect(edge).toBeInstanceOf(GraphvizObject);
  });

  describe('renders correctly by toDot method', () => {
    it('simple edge', () => {
      expect(toDot(edge, DigraphContext)).toMatchSnapshot();
    });

    describe('edge with comment', () => {
      test('single line comment', () => {
        edge.comment = 'this is comment.';
        expect(toDot(edge, DigraphContext)).toMatchSnapshot();
      });

      test('multi line comment', () => {
        edge.comment = 'this is comment.\nsecond line.';
        expect(toDot(edge, DigraphContext)).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(toDot(edge, DigraphContext)).toMatchSnapshot();
    });

    it('graphType is "graph"', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(toDot(edge, GraphContext)).toMatchSnapshot();
    });

    it('3 nodes', () => {
      edge = new Edge([node1, node2, node3]);
      expect(toDot(edge, DigraphContext)).toMatchSnapshot();
    });

    it('3 nodes, but many args', () => {
      edge = new Edge([node1, node2, node3, node1, node2, node3, node1, node2, node3]);
      expect(toDot(edge, DigraphContext)).toMatchSnapshot();
    });
  });
});
