import { beforeEach, describe, expect, it, test, vi } from 'vitest';
import './register-default.js';

import { EdgeTargetTuple, NodeModel } from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';
import { DotObject } from './DotObject.js';
import { Edge } from './Edge.js';
import { GraphBase } from './GraphBase.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

class TestGraph extends GraphBase<any> {
  public readonly directed = false;
  public strict = true;
}

let g: TestGraph;
beforeEach(() => {
  g = new TestGraph();
});

it('should be instance of GraphBase/AttributesBase/DotObject', () => {
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(AttributesBase);
  expect(g).toBeInstanceOf(DotObject);
});

describe('Constructor', () => {
  test('first argument is attributes object', () => {
    const root = new TestGraph({
      label: 'Label',
    });
    expect(root.size).toBe(1);
    expect(root.get('label')).toBe('Label');
  });
});

describe('Imperative API(addXxx existXxx removeXxx methods)', () => {
  test('Node operation methods works', () => {
    expect(g.existNode('foo')).toBe(false);
    const node = new Node('foo');
    g.addNode(node);
    expect(g.existNode('foo')).toBe(true);
    g.removeNode(node);
    expect(g.existNode('foo')).toBe(false);
    g.addNode(node);
    expect(g.existNode('foo')).toBe(true);
    g.removeNode('foo');
    expect(g.existNode('foo')).toBe(false);
  });

  test('Edge operation methods works', () => {
    const nodes = ['foo', 'bar'].map((id) =>
      g.createNode(id),
    ) as EdgeTargetTuple;
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

describe('Declarative API', () => {
  describe('node method', () => {
    describe('create node if not exists', () => {
      test('by id', () => {
        const createNodeSpy = vi.spyOn(g, 'createNode');

        g.node('foo');
        expect(g.existNode('foo')).toBe(true);
        expect(createNodeSpy).toHaveBeenCalledWith('foo');
      });

      test('with attributes', () => {
        expect(g.existNode('foo')).toBe(false);
        const createNodeSpy = vi.spyOn(g, 'createNode');

        const node = g.node('foo', {
          label: 'Test label',
        });

        expect(g.existNode('foo')).toBe(true);
        expect(createNodeSpy).toHaveBeenCalledWith('foo');
        expect(node.attributes.get('label')).toStrictEqual('Test label');
      });

      describe('callback function is given, the callback function is executed with the created node as the argument', () => {
        test('first argument is id, seccond argument is callback', () => {
          const callback = vi.fn();
          const node = g.node('foo', callback);
          expect(callback).toHaveBeenCalledWith(node);
        });

        test('first argument is id, seccond argument is attribute object, third argument is callback', () => {
          const callback = vi.fn();
          const node = g.node('foo', { label: 'Test label' }, callback);
          expect(callback).toHaveBeenCalledWith(node);
          expect(node.attributes.get('label')).toStrictEqual('Test label');
        });
      });
    });

    describe('get node if exists', () => {
      test('by id', () => {
        const createdNode = g.createNode('foo');
        const createNodeSpy = vi.spyOn(g, 'createNode');

        const returnedNode = g.node('foo');

        expect(createNodeSpy).not.toHaveBeenCalled();
        expect(returnedNode).toBe(createdNode);
      });

      test('with attributes', () => {
        const createdNode = g.createNode('foo');
        const createNodeSpy = vi.spyOn(g, 'createNode');

        const returnedNode = g.node('foo', { label: 'Test label' });

        expect(createNodeSpy).not.toHaveBeenCalled();
        expect(returnedNode).toBe(createdNode);

        expect(returnedNode.attributes.get('label')).toStrictEqual(
          'Test label',
        );
      });

      describe('callback function is given, the callback function is executed with the created node as the argument', () => {
        let createdNode: NodeModel;
        beforeEach(() => {
          createdNode = g.createNode('foo');
        });

        test('first argument is id, seccond argument is callback', () => {
          const callback = vi.fn();
          const node = g.node('foo', callback);
          expect(callback).toHaveBeenCalledWith(node);
          expect(node).toBe(createdNode);
        });

        test('first argument is id, seccond argument is attribute object, third argument is callback', () => {
          const callback = vi.fn();
          const node = g.node('foo', { label: 'Test label' }, callback);
          expect(callback).toHaveBeenCalledWith(node);
          expect(node.attributes.get('label')).toStrictEqual('Test label');
          expect(node).toBe(createdNode);
        });
      });
    });

    test('apply atttibutes to nodes in graph', () => {
      g.node({ label: 'Test label' });
      expect(g.attributes.node.get('label')).toStrictEqual('Test label');
    });
  });

  describe('edge method', () => {
    describe('create edge', () => {
      let nodes: EdgeTargetTuple;
      beforeEach(() => {
        nodes = ['foo', 'bar'].map((id) => g.createNode(id)) as EdgeTargetTuple;
      });

      test('create edge with target nodes', () => {
        const createEdgeSpy = vi.spyOn(g, 'createEdge');
        g.edge(nodes);
        expect(createEdgeSpy).toHaveBeenCalledWith(nodes, undefined);
      });

      test('create edge and apply attribute', () => {
        const createEdgeSpy = vi.spyOn(g, 'createEdge');
        g.edge(nodes, { label: 'Test label' });
        expect(createEdgeSpy).toHaveBeenCalledWith(nodes, {
          label: 'Test label',
        });
      });

      test('apply atttibutes to edges in graph', () => {
        g.edge({ label: 'Test label' });
        expect(g.attributes.edge.get('label')).toStrictEqual('Test label');
      });

      describe('callback function is given, the callback function is executed with the created edge as the argument', () => {
        test('first argument is id, seccond argument is callback', () => {
          const callback = vi.fn();
          const edge = g.edge(nodes, callback);
          expect(callback).toHaveBeenCalledWith(edge);
        });

        test('first argument is id, seccond argument is attribute object, third argument is callback', () => {
          const callback = vi.fn();
          const edge = g.edge(nodes, { label: 'Test label' }, callback);
          expect(callback).toHaveBeenCalledWith(edge);
          expect(edge.attributes.get('label')).toStrictEqual('Test label');
        });
      });
    });

    test('apply atttibutes to edges in graph', () => {
      g.edge({ label: 'Test label' });
      expect(g.attributes.edge.get('label')).toStrictEqual('Test label');
    });
  });

  describe('subgraph method', () => {
    describe('create subgraph if not exists', () => {
      test('no id', () => {
        const createSubgraphSpy = vi.spyOn(g, 'createSubgraph');
        const subgraph = g.subgraph();
        expect(subgraph).toBeInstanceOf(Subgraph);
        expect(createSubgraphSpy).toHaveBeenCalled();
      });

      test('only attributes', () => {
        const createSubgraphSpy = vi.spyOn(g, 'createSubgraph');
        const subgraph = g.subgraph({ label: 'Test label' });
        expect(createSubgraphSpy).toHaveBeenCalled();
        expect(subgraph.get('label')).toStrictEqual('Test label');
      });

      test('by id', () => {
        const createSubgraphSpy = vi.spyOn(g, 'createSubgraph');
        g.subgraph('foo');
        expect(createSubgraphSpy).toHaveBeenCalledWith('foo');
      });

      test('with attributes', () => {
        const createSubgraphSpy = vi.spyOn(g, 'createSubgraph');
        const subgraph = g.subgraph('foo', { label: 'Test label' });
        expect(createSubgraphSpy).toHaveBeenCalledWith('foo');
        expect(subgraph.get('label')).toStrictEqual('Test label');
      });

      describe('callback function is given, the callback function is executed with the created subgraph as the argument', () => {
        test('first argument is callback', () => {
          const callback = vi.fn();
          const subgraph = g.subgraph(callback);
          expect(callback).toHaveBeenCalledWith(subgraph);
        });

        test('first argument is attribute, seccond argument is callback', () => {
          const callback = vi.fn();
          const subgraph = g.subgraph({ label: 'Test label' }, callback);
          expect(callback).toHaveBeenCalledWith(subgraph);
          expect(subgraph.get('label')).toStrictEqual('Test label');
        });

        test('first argument is id, seccond argument is callback', () => {
          const callback = vi.fn();
          const subgraph = g.subgraph('foo', callback);
          expect(callback).toHaveBeenCalledWith(subgraph);
        });

        test('first argument is id, seccond argument is attribute object, third argument is callback', () => {
          const callback = vi.fn();
          const subgraph = g.subgraph('foo', { label: 'Test label' }, callback);
          expect(callback).toHaveBeenCalledWith(subgraph);
          expect(subgraph.get('label')).toStrictEqual('Test label');
        });
      });
    });

    describe('get subgraph if exists', () => {
      test('by id', () => {
        const createdSubgraph = g.createSubgraph('foo');
        const createSubgraphSpy = vi.spyOn(g, 'createSubgraph');

        const returnedSubgraph = g.subgraph('foo');

        expect(createSubgraphSpy).not.toHaveBeenCalled();
        expect(returnedSubgraph).toBe(createdSubgraph);
      });

      test('with attributes', () => {
        const createdSubgraph = g.createSubgraph('foo');
        const createSubgraphSpy = vi.spyOn(g, 'createSubgraph');

        const returnedSubgraph = g.subgraph('foo', { label: 'Test label' });

        expect(createSubgraphSpy).not.toHaveBeenCalled();
        expect(returnedSubgraph).toBe(createdSubgraph);

        expect(returnedSubgraph.get('label')).toStrictEqual('Test label');
      });
    });
  });

  describe('graph method', () => {
    test('apply atttibutes to graphs in graph', () => {
      g.graph({ label: 'Test label' });
      expect(g.attributes.graph.get('label')).toStrictEqual('Test label');
    });
  });
});

describe('Models Context API', () => {
  class TestNode extends Node {}
  class TestEdge extends Edge {}
  class TestSubgraphA extends Subgraph {}
  class TestSubgraphB extends Subgraph {}
  class TestSubgraphC extends Subgraph {}

  describe('By providing a context in the with method, the object created by createXxx is created with the model given by the context.', () => {
    test('with TestNode', () => {
      g.with({ Node: TestNode });

      const node = g.createNode('hoge');
      expect(node).toBeInstanceOf(TestNode);
    });

    test('with TestEdge', () => {
      g.with({ Edge: TestEdge });

      const edge = g.createEdge(['foo', 'bar']);
      expect(edge).toBeInstanceOf(TestEdge);
    });

    test('with TestSubgraph', () => {
      g.with({ Subgraph: TestSubgraphA });

      const subgraph = g.createSubgraph();
      expect(subgraph).toBeInstanceOf(TestSubgraphA);
    });

    test('In nested contexts, the settings are inherited. It also does not affect the parent context.', () => {
      const sub = g.createSubgraph();
      expect(sub).toBeInstanceOf(Subgraph);

      sub.with({ Subgraph: TestSubgraphA });
      const A = sub.createSubgraph();
      expect(A).toBeInstanceOf(TestSubgraphA);

      A.with({ Subgraph: TestSubgraphB });
      const B = A.createSubgraph();
      expect(B).toBeInstanceOf(TestSubgraphB);

      B.with({ Subgraph: TestSubgraphC });
      const C = B.createSubgraph();
      expect(C).toBeInstanceOf(TestSubgraphC);

      expect(sub.createSubgraph()).toBeInstanceOf(TestSubgraphA);
      expect(A.createSubgraph()).toBeInstanceOf(TestSubgraphB);
      expect(B.createSubgraph()).toBeInstanceOf(TestSubgraphC);
    });
  });
});
