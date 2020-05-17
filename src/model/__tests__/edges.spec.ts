import { DotObject, GraphvizObject } from '../abstract';
import { Edge } from '../edges';
import { Node } from '../nodes';
import { attribute } from '../../attribute';

describe('class Edge', () => {
  let edge: Edge;

  const targets = Array(2)
    .fill(true)
    .map((_, i) => new Node(`node${i + 1}`));

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

  it('should be instance of Edge/DotObject/GraphvizObject', () => {
    expect(edge).toBeInstanceOf(Edge);
    expect(edge).toBeInstanceOf(DotObject);
    expect(edge).toBeInstanceOf(GraphvizObject);
  });
});
