import { attribute as _ } from '../attribute.js';
import { DotObject } from './DotObject.js';
import { Node } from './Node.js';

let node: Node;
beforeEach(() => {
  node = new Node('test');
});

describe('Constructor', () => {
  test('first argument is id, and second attributes object', () => {
    node = new Node('test', {
      [_.label]: 'Label',
    });
    expect(node.id).toBe('test');
    expect(node.attributes.size).toBe(1);
    expect(node.attributes.get(_.label)).toBe('Label');
  });
});

it('should be instance of Node/DotObject', () => {
  expect(node).toBeInstanceOf(Node);
  expect(node).toBeInstanceOf(DotObject);
});
