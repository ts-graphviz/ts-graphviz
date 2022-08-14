import { attribute } from '../../attribute/index.js';
import { DotObject, GraphvizObject } from '../abstract.js';
import { Edge } from '../edges.js';
import { Node } from '../nodes.js';
import { EdgeTargetTuple } from '../types.js';

describe('class Edge', () => {
  let edge: Edge;

  const targets = [...Array(2)].map((_, i) => new Node(`node${i + 1}`)) as EdgeTargetTuple;

  beforeEach(() => {
    edge = new Edge(targets);
  });

  describe('Constructor', () => {
    test('first argument is targets, and second attributes object', () => {
      edge = new Edge(targets, {
        [attribute.label]: 'Label',
      });
      expect(edge.attributes.size).toBe(1);
      expect(edge.attributes.get(attribute.label)).toBe('Label');
    });
  });

  it('throws an error when the EdgeTarget element is missing', () => {
    const n = new Node('id');
    expect(() => new Edge([] as unknown as EdgeTargetTuple)).toThrow();
    expect(() => new Edge([n] as unknown as EdgeTargetTuple)).toThrow();
  });

  it('should be instance of Edge/DotObject/GraphvizObject', () => {
    expect(edge).toBeInstanceOf(Edge);
    expect(edge).toBeInstanceOf(DotObject);
    expect(edge).toBeInstanceOf(GraphvizObject);
  });
});
