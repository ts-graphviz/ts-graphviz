import 'jest-graphviz';
import { DotBase, GraphvizObject } from '../../../common';
import { Edge } from '../../Edge';
import { Node } from '../../Node';
import { Cluster, Subgraph } from '../Cluster';
import { Digraph } from '../Digraph';
import { Graph } from '../Graph';

describe('class Subgraph', () => {
  let g: Digraph | Graph;
  let createEdge: (...nodes: Node[]) => Edge;
  const testCases: { title: string; beforeEachFunc: () => void }[] = [
    {
      title: 'root is Digraph',
      beforeEachFunc: () => {
        g = new Digraph();
        createEdge = (...nodes: Node[]) => new Edge({ graphType: 'graph' }, ...nodes);
      },
    },
    {
      title: 'root is Graph',
      beforeEachFunc: () => {
        g = new Graph();
        createEdge = (...nodes: Node[]) => new Edge({ graphType: 'graph' }, ...nodes);
      },
    },
  ];

  testCases.forEach(({ title, beforeEachFunc }) => {
    describe(title, () => {
      beforeEach(beforeEachFunc);
      let subgraph: Subgraph;

      beforeEach(() => {
        subgraph = g.context.createSubgraph('test');
      });

      it('should be instance of Subgraph/Cluster/DotBase/GraphvizObject', () => {
        expect(subgraph).toBeInstanceOf(Subgraph);
        expect(subgraph).toBeInstanceOf(Cluster);
        expect(subgraph).toBeInstanceOf(DotBase);
        expect(subgraph).toBeInstanceOf(GraphvizObject);
      });

      it('should be subgraph, when subgraph id is "test"', () => {
        subgraph = g.context.createSubgraph('test');
        expect(subgraph.isSubgraphCluster()).toBe(false);
      });

      it('should be escaped if id contains a newline character', () => {
        subgraph = new Subgraph(g.context);
        subgraph.id = '1\n2\n';
        const dot = g.toDot();
        expect(dot).toBeValidDotAndMatchSnapshot();
      });

      it('should be escaped if id contains a comma', () => {
        subgraph = new Subgraph(g.context);
        subgraph.id = '1"2"';
        const dot = g.toDot();
        expect(dot).toBeValidDotAndMatchSnapshot();
      });

      it('should be subgraph cluster, when subgraph id is "cluster_test"', () => {
        subgraph = g.context.createSubgraph('cluster_test');
        expect(subgraph.isSubgraphCluster()).toBe(true);
      });

      describe('label attribute behavior', () => {
        it('plain text label to be quoted by double quotation', () => {
          subgraph.attributes.graph.set('label', 'this is test for graph label');
          subgraph.attributes.edge.set('label', 'this is test for edge label');
          subgraph.attributes.node.set('label', 'this is test for node label');
          expect(subgraph.toDot()).toMatchSnapshot();
          expect(g.toDot()).toBeValidDot();
        });

        it('html like', () => {
          subgraph.attributes.graph.set('label', '<<B>this is test for graph label</B>>');
          subgraph.attributes.edge.set('label', '<<U>this is test for edge label</U>>');
          subgraph.attributes.node.set('label', '<<I>this is test for node label</I>>');
          expect(subgraph.toDot()).toMatchSnapshot();
          expect(g.toDot()).toBeValidDot();
        });
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
          const [node1, node2] = ['node1', 'node2'].map(id => subgraph.createNode(id));
          const edge = createEdge(node1, node2);
          expect(subgraph.existEdge(edge)).toBe(false);
          subgraph.addEdge(edge);
          expect(subgraph.existEdge(edge)).toBe(true);
          expect(subgraph.toDot()).toMatchSnapshot();
          subgraph.removeEdge(edge);
          expect(subgraph.existEdge(edge)).toBe(false);
        });

        it('Subgraph operation methods works', () => {
          const sub = subgraph.context.createSubgraph('sub');
          expect(subgraph.existSubgraph(sub)).toBe(false);
          subgraph.addSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(true);
          expect(subgraph.toDot()).toMatchSnapshot();
          subgraph.removeSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(false);
          subgraph.addSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(true);
          subgraph.removeSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(false);
        });
      });
    });
  });
});
