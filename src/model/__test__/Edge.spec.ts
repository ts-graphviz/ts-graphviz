import { DotBase, GraphvizObject } from '../../common';

import { DigraphEdge, Edge, GraphEdge } from '../Edge';
import { Node } from '../Node';

describe('class Edge', () => {
  let edge: Edge;

  const [node1, node2, node3] = new Array(3).fill(true).map((_, i) => new Node(`node${i + 1}`));
  beforeEach(() => {
    edge = new DigraphEdge(node1, node2);
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

    it('should be escaped if id contains a newline character', () => {
      edge = new DigraphEdge(node1, new Node('1\n2\n'));
      expect(edge.toDot()).toBe('"node1" -> "1\\n2\\n";');
    });

    it('should be escaped if id contains a comma', () => {
      edge = new DigraphEdge(node1, new Node('1"2"'));
      expect(edge.toDot()).toBe('"node1" -> "1\\"2\\"";');
    });

    it('has some attributes', () => {
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(edge.toDot()).toMatchSnapshot();
    });

    it('graphType is "graph"', () => {
      edge = new GraphEdge(node1, node2);
      edge.attributes.set('label', 'this is test');
      edge.attributes.set('color', 'red');
      expect(edge.toDot()).toMatchSnapshot();
    });

    it('3 nodes', () => {
      edge = new DigraphEdge(node1, node2, node3);
      expect(edge.toDot()).toMatchSnapshot();
    });

    it('3 nodes, but many args', () => {
      edge = new DigraphEdge(node1, node2, node3, node1, node2, node3, node1, node2, node3);
      expect(edge.toDot()).toMatchSnapshot();
    });

    describe('label attribute behavior', () => {
      it('plain text label to be quoted by double quotation', () => {
        edge.attributes.set('label', 'this is test');
        expect(edge.toDot()).toMatchSnapshot();
      });

      it('html like', () => {
        edge.attributes.set('label', '<<B>this is test</B>>');
        expect(edge.toDot()).toMatchSnapshot();
      });
    });
  });
});
