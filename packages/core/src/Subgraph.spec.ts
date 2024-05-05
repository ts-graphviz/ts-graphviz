import type { EdgeTargetTuple, SubgraphModel } from '@ts-graphviz/common';
import { registerDefault } from '@ts-graphviz/core';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { AttributesBase } from './AttributesBase.js';
import { GraphBase } from './GraphBase.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';
registerDefault();

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
      subgraph = new Subgraph('test', {
        K: 1,
      });
      expect(subgraph.id).toBe('test');
      expect(subgraph.get('K')).toBe(1);
    });
    test('first argument is attributes object', () => {
      subgraph = new Subgraph({
        K: 1,
      });
      expect(subgraph.get('K')).toBe(1);
    });
  });

  describe('Declaratively set the attributes of the objects in the cluster', () => {
    test('node', () => {
      subgraph.node({
        label: 'test label',
      });
      expect(subgraph.attributes.node.get('label')).toBe('test label');
    });

    test('edge', () => {
      subgraph.edge({
        label: 'test label',
      });
      expect(subgraph.attributes.edge.get('label')).toBe('test label');
    });

    test('graph', () => {
      subgraph.graph({
        label: 'test label',
      });
      expect(subgraph.attributes.graph.get('label')).toBe('test label');
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

  test('create node with attributes', () => {
    const node = subgraph.createNode('n', {
      label: 'Label',
    });
    expect(node.id).toBe('n');
    expect(node.attributes.size).toBe(1);
  });

  test('create edge with attributes', () => {
    const nodes = [...Array(2)].map((_v, i) =>
      subgraph.createNode(`node${i + 1}`),
    ) as EdgeTargetTuple;
    const edge = subgraph.createEdge(nodes, {
      label: 'Label',
    });
    expect(edge.attributes.size).toBe(1);
  });

  test('create edge by node group', () => {
    const [node1, node2, node3, node4] = Array(4)
      .fill(true)
      .map((_v, i) => subgraph.createNode(`node${i + 1}`));
    const edge = subgraph.createEdge([node1, [node2, node3], node4]);
    expect(edge.targets.length).toBe(3);
  });

  test('create subgraph with attributes', () => {
    subgraph = subgraph.createSubgraph('test', {
      label: 'Label',
    });
    expect(subgraph.id).toBe('test');
    expect(subgraph.size).toBe(1);

    subgraph = subgraph.createSubgraph({
      label: 'Label',
    });
    expect(subgraph.size).toBe(1);
  });

  test.each([
    ['cluster', true],
    ['cluster_hoge', true],
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
      const nodes = [...Array(2)].map((_v, i) =>
        subgraph.createNode(`node${i + 1}`),
      ) as EdgeTargetTuple;
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
      expect(() =>
        subgraph.edge([] as unknown as EdgeTargetTuple),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: The element of Edge target is missing or not satisfied as Edge target.]`,
      );
      expect(() =>
        subgraph.edge([n] as unknown as EdgeTargetTuple),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: The element of Edge target is missing or not satisfied as Edge target.]`,
      );
    });
  });
});
