import { attribute } from '../attribute.js';
import {
  AttributeList,
  AttributesBase,
  DotObject,
  GraphvizObject,
  GraphBase,
  Subgraph,
  Node,
  Edge,
  Graph,
  Digraph,
} from '../models.js';
import { EdgeTargetTuple, SubgraphModel } from '../common/index.js';

describe('class AttributeList', () => {
  let attrs: AttributeList<'Node'>;
  beforeEach(() => {
    attrs = new AttributeList('Node');
  });

  it('should be instance of AttributeList/AttributesBase/DotObject/GraphvizObject', () => {
    expect(attrs).toBeInstanceOf(AttributeList);
    expect(attrs).toBeInstanceOf(AttributesBase);
    expect(attrs).toBeInstanceOf(DotObject);
    expect(attrs).toBeInstanceOf(GraphvizObject);
  });

  it('size should be 0 by default', () => {
    expect(attrs.size).toBe(0);
  });

  describe('Constructor', () => {
    test('with attribute object', () => {
      attrs = new AttributeList('Node', {
        [attribute.label]: 'Label',
      });
      expect(attrs.size).toBe(1);
      expect(attrs.get(attribute.label)).toBe('Label');
    });
  });

  describe('apply/clear attribute', () => {
    test('with attributes object', () => {
      attrs.apply({
        [attribute.label]: 'this is test',
        [attribute.color]: 'red',
        [attribute.fontsize]: 16,
      });
      expect(attrs.size).toBe(3);
      attrs.clear();
      expect(attrs.size).toBe(0);
    });

    test('with entities', () => {
      attrs.apply([
        [attribute.label, 'this is test'],
        [attribute.color, 'red'],
        [attribute.fontsize, 16],
      ]);
      expect(attrs.size).toBe(3);
      attrs.clear();
      expect(attrs.size).toBe(0);
    });
  });

  test('set/get/delete attribute', () => {
    const id = 'test';
    attrs.set('label', id);
    expect(attrs.get('label')).toBe(id);
    attrs.delete('label');
    expect(attrs.get('label')).toBeUndefined();
  });
});

describe('class Subgraph', () => {
  let subgraph: SubgraphModel;

  beforeEach(() => {
    subgraph = new Subgraph();
  });

  it('should be instance of Subgraph/Cluster/AttributesBase/DotObject/GraphvizObject', () => {
    expect(subgraph).toBeInstanceOf(Subgraph);
    expect(subgraph).toBeInstanceOf(GraphBase);
    expect(subgraph).toBeInstanceOf(AttributesBase);
    expect(subgraph).toBeInstanceOf(DotObject);
    expect(subgraph).toBeInstanceOf(GraphvizObject);
  });

  describe('Constructor', () => {
    test('first argument is id, and second attributes object', () => {
      subgraph = new Subgraph('test', {
        [attribute.K]: 1,
      });
      expect(subgraph.id).toBe('test');
      expect(subgraph.get(attribute.K)).toBe(1);
    });
    test('first argument is attributes object', () => {
      subgraph = new Subgraph({
        [attribute.K]: 1,
      });
      expect(subgraph.get(attribute.K)).toBe(1);
    });
  });

  describe('Declaratively set the attributes of the objects in the cluster', () => {
    test('node', () => {
      subgraph.node({
        label: 'test label',
      });
      expect(subgraph.attributes.node.get(attribute.label)).toBe('test label');
    });

    test('edge', () => {
      subgraph.edge({
        label: 'test label',
      });
      expect(subgraph.attributes.edge.get(attribute.label)).toBe('test label');
    });

    test('graph', () => {
      subgraph.graph({
        label: 'test label',
      });
      expect(subgraph.attributes.graph.get(attribute.label)).toBe('test label');
    });
  });

  test('set attributes', () => {
    subgraph.set(attribute.rank, 'same');
    expect(subgraph.get(attribute.rank)).toBe('same');
  });

  describe('set attributes by apply', () => {
    test('with attributes object', () => {
      subgraph.apply({
        [attribute.rank]: 'same',
      });
      expect(subgraph.get(attribute.rank)).toBe('same');
    });

    test('with entities', () => {
      subgraph.apply([[attribute.rank, 'same']]);
      expect(subgraph.get(attribute.rank)).toBe('same');
    });
  });

  it('should be subgraph, when subgraph id is "test"', () => {
    expect(subgraph.isSubgraphCluster()).toBe(false);
  });

  test('create node with attributes', () => {
    const node = subgraph.createNode('n', {
      [attribute.label]: 'Label',
    });
    expect(node.id).toBe('n');
    expect(node.attributes.size).toBe(1);
  });

  test('create edge with attributes', () => {
    const nodes = [...Array(2)].map((_v, i) => subgraph.createNode(`node${i + 1}`)) as EdgeTargetTuple;
    const edge = subgraph.createEdge(nodes, {
      [attribute.label]: 'Label',
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
      [attribute.label]: 'Label',
    });
    expect(subgraph.id).toBe('test');
    expect(subgraph.size).toBe(1);

    subgraph = subgraph.createSubgraph({
      [attribute.label]: 'Label',
    });
    expect(subgraph.size).toBe(1);
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
      const nodes = [...Array(2)].map((_v, i) => subgraph.createNode(`node${i + 1}`)) as EdgeTargetTuple;
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
      expect(() => subgraph.edge([] as unknown as EdgeTargetTuple)).toThrow();
      expect(() => subgraph.edge([n] as unknown as EdgeTargetTuple)).toThrow();
    });
  });
});

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
