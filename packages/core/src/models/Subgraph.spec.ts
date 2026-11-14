import type { NodeModel, SubgraphModel } from '@ts-graphviz/common';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { AttributesBase } from '../attributes/AttributesBase.js';
import { Edge } from './Edge.js';
import { GraphBase } from './GraphBase.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

describe('class Subgraph', () => {
  let subgraph: SubgraphModel;

  beforeEach(() => {
    subgraph = new Subgraph();
  });

  it('should be instance of Subgraph/Cluster/AttributesBase', () => {
    expect(subgraph).toBeInstanceOf(Subgraph);
    expect(subgraph).toBeInstanceOf(GraphBase);
    expect(subgraph).toBeInstanceOf(AttributesBase);
  });

  describe('Constructor', () => {
    test('first argument is id, and second attributes object', () => {
      subgraph = new Subgraph('cluster_test', {
        K: 1,
      });
      expect(subgraph.id).toBe('cluster_test');
      expect(subgraph.get('K')).toBe(1);
    });
    test('first argument is attributes object', () => {
      subgraph = new Subgraph({
        cluster: true,
        K: 1,
      });
      expect(subgraph.get('K')).toBe(1);
    });
  });

  test('set attributes', () => {
    subgraph.set('rank', 'same');
    expect(subgraph.get('rank')).toBe('same');
  });

  describe('set attributes by apply', () => {
    test('with attributes object', () => {
      subgraph.apply({
        rank: 'same',
      });
      expect(subgraph.get('rank')).toBe('same');
    });

    test('with entities', () => {
      subgraph.apply([['rank', 'same']]);
      expect(subgraph.get('rank')).toBe('same');
    });
  });

  it('should be subgraph, when subgraph id is "test"', () => {
    expect(subgraph.isSubgraphCluster()).toBe(false);
  });

  test.each([
    ['cluster', true],
    ['cluster_hoge', true],
    ['CLUSTER_hoge', true],
    ['Cluster', true],
    ['hoge_cluster', false],
    ['example', false],
  ])(
    'if cluster named "%s", isSubgraphCluster should be %p',
    (id, expected) => {
      subgraph = new Subgraph(id);
      expect(subgraph.isSubgraphCluster()).toBe(expected);
    },
  );

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
      const nodes: [NodeModel, NodeModel] = [
        new Node('node1'),
        new Node('node2'),
      ];
      const edge = new Edge(nodes);
      subgraph.addEdge(edge);
      expect(subgraph.existEdge(edge)).toBe(true);
      subgraph.removeEdge(edge);
      expect(subgraph.existEdge(edge)).toBe(false);
    });

    it('Subgraph operation methods works', () => {
      const sub = new Subgraph('sub');
      subgraph.addSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(true);
      subgraph.removeSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(false);
      subgraph.addSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(true);
      subgraph.removeSubgraph(sub);
      expect(subgraph.existSubgraph(sub)).toBe(false);
    });

    it('should be undefined, when id not set', () => {
      const sub = new Subgraph();
      expect(sub.id).toBeUndefined();
      expect(sub.isSubgraphCluster()).toBe(false);
    });
  });
});

describe('isSubgraphCluster with the cluster attribute', () => {
  test.each([
    [true, true],
    [false, false],
    ['true', true],
    ['YES', true],
    ['1', true],
    ['0', false],
    [1, true],
    [0, false],
    ['no', false],
    ['maybe', false],
  ])('cluster = %j makes it a cluster: %p', (value, expected) => {
    const subgraph = new Subgraph('s');
    subgraph.set('cluster', value as boolean);
    expect(subgraph.isSubgraphCluster()).toBe(expected);
  });

  test('an anonymous subgraph with cluster = true is a cluster', () => {
    expect(new Subgraph({ cluster: true }).isSubgraphCluster()).toBe(true);
    expect(new Subgraph().isSubgraphCluster()).toBe(false);
  });
});
