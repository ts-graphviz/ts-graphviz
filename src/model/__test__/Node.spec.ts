import { DotBase, GraphvizObject } from '../../abstract';
import { Node } from '../Node';

describe('class Node', () => {
  let node: Node;
  beforeEach(() => {
    node = new Node('test');
  });

  it('should be instance of Node/DotBase/GraphvizObject', () => {
    expect(node).toBeInstanceOf(Node);
    expect(node).toBeInstanceOf(DotBase);
    expect(node).toBeInstanceOf(GraphvizObject);
  });

  describe('renders correctly by toDot method', () => {
    it('simple node', () => {
      expect(node.toDot()).toMatchSnapshot();
    });

    describe('node with comment', () => {
      test('single line comment', () => {
        node.comment = 'this is comment.';
        expect(node.toDot()).toMatchSnapshot();
      });

      test('multi line comment', () => {
        node.comment = 'this is comment.\nsecond line.';
        expect(node.toDot()).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      node.attributes.set('label', 'this is test');
      node.attributes.set('color', 'red');
      expect(node.toDot()).toMatchSnapshot();
    });
  });
});
