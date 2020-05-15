import { DotObject, GraphvizObject } from '../abstract';
import { Node } from '../nodes';

describe('class Node', () => {
  let node: Node;
  beforeEach(() => {
    node = new Node('test');
  });

  it('should be instance of Node/DotObject/GraphvizObject', () => {
    expect(node).toBeInstanceOf(Node);
    expect(node).toBeInstanceOf(DotObject);
    expect(node).toBeInstanceOf(GraphvizObject);
  });
});
