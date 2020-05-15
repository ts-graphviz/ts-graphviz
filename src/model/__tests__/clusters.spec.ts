import 'jest-graphviz';
import { DotObject, GraphvizObject } from '../abstract';
import { ISubgraph } from '../../types';
import { AttributesBase } from '../attributes-base';
import { Cluster } from '../clusters';
import { Node } from '../nodes';
import { Subgraph } from '../clusters';

describe('class Subgraph', () => {
  let subgraph: ISubgraph;

  beforeEach(() => {
    subgraph = new Subgraph('test');
  });

  it('should be instance of Subgraph/Cluster/AttributesBase/DotObject/GraphvizObject', () => {
    expect(subgraph).toBeInstanceOf(Subgraph);
    expect(subgraph).toBeInstanceOf(Cluster);
    expect(subgraph).toBeInstanceOf(AttributesBase);
    expect(subgraph).toBeInstanceOf(DotObject);
    expect(subgraph).toBeInstanceOf(GraphvizObject);
  });

  test('set attributes', () => {
    subgraph.set('rank', 'same');
    expect(subgraph.get('rank')).toBe('same');
  });

  test('set attributes by apply', () => {
    subgraph.apply({
      rank: 'same',
    });
    expect(subgraph.get('rank')).toBe('same');
  });

  it('should be subgraph, when subgraph id is "test"', () => {
    expect(subgraph.isSubgraphCluster()).toBe(false);
  });

  test.each([
    ['cluster', true],
    ['cluster_hoge', true],
    ['hoge_cluster', false],
    ['example', false],
  ])('if cluster named "%s", isSubgraphCluster should be %p', (id, expected) => {
    subgraph = new Subgraph(id);
    expect(subgraph.isSubgraphCluster()).toBe(expected);
  });

  it('should be subgraph cluster, when subgraph id is "cluster_test"', () => {
    subgraph = new Subgraph('cluster_test');
    expect(subgraph.isSubgraphCluster()).toBe(true);
  });

  describe('addXxx existXxx removeXxx APIs', () => {
    it('Node operation methods works', () => {
      const id = 'node';
      expect(subgraph.existNode(id)).toBe(false);
      const node = new Node(id);
      subgraph.addNode(node);
      expect(subgraph.existNode(id)).toBe(true);
      subgraph.removeNode(node);
      expect(subgraph.existNode(id)).toBe(false);
      subgraph.addNode(node);
      expect(subgraph.existNode(id)).toBe(true);
      subgraph.removeNode(node.id);
      expect(subgraph.existNode(id)).toBe(false);
    });

    it('Edge operation methods works', () => {
      const nodes = ['node1', 'node2'].map((id) => subgraph.createNode(id));
      const edge = subgraph.createEdge(nodes);
      expect(subgraph.existEdge(edge)).toBe(true);
      subgraph.removeEdge(edge);
      expect(subgraph.existEdge(edge)).toBe(false);
    });

    it('Subgraph operation methods works', () => {
      const sub = subgraph.createSubgraph('sub');
      expect(subgraph.existSubgraph(sub)).toBe(true);
      subgraph.removeSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(false);
      subgraph.addSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(true);
      subgraph.removeSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(false);
    });

    it('should be undefined, when id not set', () => {
      const sub = subgraph.createSubgraph();
      expect(sub.id).toBeUndefined();
      expect(sub.isSubgraphCluster()).toBe(false);
    });

    it('throws an error when the EdgeTarget element is missing', () => {
      const n = subgraph.node('n');
      expect(() => {
        subgraph.edge([]);
      }).toThrow();
      expect(() => {
        subgraph.edge([n]);
      }).toThrow();
    });
  });
});
