import { beforeEach, describe, expect, it, test } from 'vitest';
import { DotObject } from './DotObject.js';
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

it('should be instance of Node/DotObject', () => {
  expect(node).toBeInstanceOf(Node);
  expect(node).toBeInstanceOf(DotObject);
});

describe('port', () => {
  test('a string is the port name', () => {
    expect(node.port('p1')).toEqual({ id: 'test', port: 'p1' });
  });

  test('an object gives the port and the compass point', () => {
    expect(node.port({ port: 'p1', compass: 'n' })).toEqual({
      id: 'test',
      port: 'p1',
      compass: 'n',
    });
  });

  test('an id in the object does not replace the id of the node', () => {
    const target = node.port({ id: 'other', port: 'p1' } as never);
    expect(target.id).toBe('test');
    expect(target.port).toBe('p1');
  });
});
