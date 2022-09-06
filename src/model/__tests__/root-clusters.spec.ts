import { attribute } from '../../attribute/index.js';
import { DotObject, GraphvizObject, AttributesBase, GraphBase, Edge, Node, Graph, Digraph } from '../models.js';
import { EdgeTargetTuple } from '../types.js';

describe('Graph', () => {
  describe('Constructor', () => {
    test('first argument is directed, and second is id, and third is strict, and fourth is attributes object', () => {
      const root = new Graph('test', false, {
        [attribute.label]: 'Label',
      });
      expect(root.id).toBe('test');
      expect(root.strict).toBe(false);
      expect(root.size).toBe(1);
      expect(root.get(attribute.label)).toBe('Label');
    });
    test('first argument is id, and second attributes object', () => {
      const root = new Graph('test', {
        [attribute.label]: 'Label',
      });
      expect(root.id).toBe('test');
      expect(root.strict).toBe(false);
      expect(root.size).toBe(1);
      expect(root.get(attribute.label)).toBe('Label');
    });
    test('first argument is strict, and second attributes object', () => {
      const root = new Graph(true, {
        [attribute.label]: 'Label',
      });
      expect(root.strict).toBe(true);
      expect(root.size).toBe(1);
      expect(root.get(attribute.label)).toBe('Label');
    });
  });

  describe.each([
    ['Digraph', () => new Graph()],
    ['Graph', () => new Digraph()],
  ])('%s', (_, rootClusterFactory) => {
    let g: Graph;
    beforeEach(() => {
      g = rootClusterFactory();
    });

    it('should be instance of RootCluster/Cluster/AttributesBase/DotObject/GraphvizObject', () => {
      expect(g).toBeInstanceOf(GraphBase);
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
