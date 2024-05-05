import { beforeEach, describe, expect, it, test } from 'vitest';
import { Node } from './Node.js';

let node: Node;
beforeEach(() => {
  node = new Node('test');
});

describe('Constructor', () => {
  test('first argument is id, and second attributes object', () => {
    node = new Node('test', {
      label: 'Label',
    });
    expect(node.id).toBe('test');
    expect(node.attributes.size).toBe(1);
    expect(node.attributes.get('label')).toBe('Label');
  });
});

it('should be instance of Node', () => {
  expect(node).toBeInstanceOf(Node);
});
