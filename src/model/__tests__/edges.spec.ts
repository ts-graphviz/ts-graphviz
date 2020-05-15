import { DotObject, GraphvizObject } from '../abstract';
import { Edge } from '../edges';
import { Node } from '../nodes';

describe('class Edge', () => {
  let edge: Edge;

  const [node1, node2] = Array(2)
    .fill(true)
    .map((_, i) => new Node(`node${i + 1}`));

  beforeEach(() => {
    edge = new Edge([node1, node2]);
  });

  it('should be instance of Edge/DotObject/GraphvizObject', () => {
    expect(edge).toBeInstanceOf(Edge);
    expect(edge).toBeInstanceOf(DotObject);
    expect(edge).toBeInstanceOf(GraphvizObject);
  });
});
