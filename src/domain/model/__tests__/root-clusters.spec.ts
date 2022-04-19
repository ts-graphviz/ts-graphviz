import 'jest-graphviz';
import { DotObject, GraphvizObject } from '../abstract';
import { AttributesBase } from '../attributes-base';
import { Cluster } from '../clusters';
import { Edge } from '../edges';
import { Node } from '../nodes';
import { RootCluster, Digraph, Graph } from '../root-clusters';
import { attribute } from '../../domain';
import { EdgeTargetTuple } from '../types';

describe('RootClusters', () => {
  describe('Constructor', () => {
    class TestRoot extends RootCluster {}
    test('first argument is id, and second is strict, and third is attributes object', () => {
      const root = new TestRoot('test', false, {
        [attribute.label]: 'Label',
      });
      expect(root.id).toBe('test');
      expect(root.strict).toBe(false);
      expect(root.size).toBe(1);
      expect(root.get(attribute.label)).toBe('Label');
    });
    test('first argument is id, and second attributes object', () => {
      const root = new TestRoot('test', {
        [attribute.label]: 'Label',
      });
      expect(root.id).toBe('test');
      expect(root.strict).toBe(false);
      expect(root.size).toBe(1);
      expect(root.get(attribute.label)).toBe('Label');
    });
    test('first argument is strict, and second attributes object', () => {
      const root = new TestRoot(true, {
        [attribute.label]: 'Label',
      });
      expect(root.strict).toBe(true);
      expect(root.size).toBe(1);
      expect(root.get(attribute.label)).toBe('Label');
    });
  });

  describe.each([
    ['Digraph', (): RootCluster => new Digraph()],
    ['Graph', (): RootCluster => new Graph()],
  ])('%s', (_, rootClusterFactory) => {
    let g: RootCluster;
    beforeEach(() => {
      g = rootClusterFactory();
    });

    it('should be instance of RootCluster/Cluster/AttributesBase/DotObject/GraphvizObject', () => {
      expect(g).toBeInstanceOf(RootCluster);
      expect(g).toBeInstanceOf(Cluster);
      expect(g).toBeInstanceOf(AttributesBase);
      expect(g).toBeInstanceOf(DotObject);
      expect(g).toBeInstanceOf(GraphvizObject);
    });

    describe('addXxx existXxx removeXxx APIs', () => {
      test('Node operation methods works', () => {
        const id = 'node';
        expect(g.existNode(id)).toBe(false);
        const node = new Node(id);
        g.addNode(node);
        expect(g.existNode(id)).toBe(true);
        g.removeNode(node);
        expect(g.existNode(id)).toBe(false);
        g.addNode(node);
        expect(g.existNode(id)).toBe(true);
        g.removeNode(node.id);
        expect(g.existNode(id)).toBe(false);
      });

      test('Edge operation methods works', () => {
        const nodes = ['node1', 'node2'].map((id) => g.createNode(id)) as EdgeTargetTuple;
        const edge = new Edge(nodes);
        expect(g.existEdge(edge)).toBe(false);
        g.addEdge(edge);
        expect(g.existEdge(edge)).toBe(true);
        g.removeEdge(edge);
        expect(g.existEdge(edge)).toBe(false);
      });

      test('Subgraph operation methods works', () => {
        const sub = g.createSubgraph('sub');
        expect(g.existSubgraph(sub)).toBe(true);
        g.removeSubgraph(sub);
        expect(g.existSubgraph(sub)).toBe(false);
        g.addSubgraph(sub);
        expect(g.existSubgraph(sub)).toBe(true);
        g.removeSubgraph(sub);
        expect(g.existSubgraph(sub)).toBe(false);
      });
    });
  });
});
