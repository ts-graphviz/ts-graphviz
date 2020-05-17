import { Node } from '../../model/nodes';
import { toDot } from '../to-dot';

describe('Node rendering', () => {
  let node: Node;
  beforeEach(() => {
    node = new Node('test');
  });

  describe('renders correctly by toDot method', () => {
    it('simple node', () => {
      expect(toDot(node)).toMatchSnapshot();
    });

    describe('node with comment', () => {
      test('single line comment', () => {
        node.comment = 'this is comment.';
        expect(toDot(node)).toMatchSnapshot();
      });

      test('multi line comment', () => {
        node.comment = 'this is comment.\nsecond line.';
        expect(toDot(node)).toMatchSnapshot();
      });
    });

    it('has some attributes', () => {
      node.attributes.set('label', 'this is test');
      node.attributes.set('color', 'red');
      expect(toDot(node)).toMatchSnapshot();
    });
  });
});
