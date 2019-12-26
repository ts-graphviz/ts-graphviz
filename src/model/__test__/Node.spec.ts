import { DotBase, GraphvizObject } from '../../common';
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

    it('should be escaped if id contains a newline character', () => {
      node = new Node('1\n2\n');
      expect(node.toDot()).toBe('"1\\n2\\n";');
    });

    it('should be escaped if id contains a comma', () => {
      node = new Node('1"2"');
      expect(node.toDot()).toBe('"1\\"2\\"";');
    });

    it('has some attributes', () => {
      node.attributes.set('label', 'this is test');
      node.attributes.set('color', 'red');
      expect(node.toDot()).toMatchSnapshot();
    });

    describe('label attribute behavior', () => {
      it('plain text label to be quoted by double quotation', () => {
        node.attributes.set('label', 'this is test');
        expect(node.toDot()).toMatchSnapshot();
      });

      it('html like', () => {
        node.attributes.set('label', '<<B>this is test</B>>');
        expect(node.toDot()).toMatchSnapshot();
      });
    });
  });
});
