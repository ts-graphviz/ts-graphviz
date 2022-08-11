import { describe, beforeEach, expect, test, it } from 'vitest';
import { DotObject, GraphvizObject } from '../abstract.js';
import { Node } from '../nodes.js';
import { attribute } from '../../attribute/index.js';

describe('class Node', () => {
  let node: Node;
  beforeEach(() => {
    node = new Node('test');
  });

  describe('Constructor', () => {
    test('first argument is id, and second attributes object', () => {
      node = new Node('test', {
        [attribute.label]: 'Label',
      });
      expect(node.id).toBe('test');
      expect(node.attributes.size).toBe(1);
      expect(node.attributes.get(attribute.label)).toBe('Label');
    });
  });

  it('should be instance of Node/DotObject/GraphvizObject', () => {
    expect(node).toBeInstanceOf(Node);
    expect(node).toBeInstanceOf(DotObject);
    expect(node).toBeInstanceOf(GraphvizObject);
  });
});
