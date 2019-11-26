import 'jest-graphviz';
import { DotBase, GraphvizObject } from '../../../common';
import { Cluster, Subgraph } from '../Cluster';
import { Digraph } from '../Digraph';
import { Graph } from '../Graph';

describe('class Subgraph', () => {
  let g: Digraph | Graph;
  const testCases: { title: string; beforeEachFunc: () => void }[] = [
    {
      title: 'root is Digraph',
      beforeEachFunc: () => {
        g = new Digraph();
      },
    },
    {
      title: 'root is Graph',
      beforeEachFunc: () => {
        g = new Graph();
      },
    },
  ];

  testCases.forEach(({ title, beforeEachFunc }) => {
    describe(title, () => {
      beforeEach(beforeEachFunc);
      let subgraph: Subgraph;

      beforeEach(() => {
        subgraph = new Subgraph(g.context, 'test');
      });

      it('should be instance of Subgraph/Cluster/DotBase/GraphvizObject', () => {
        expect(subgraph).toBeInstanceOf(Subgraph);
        expect(subgraph).toBeInstanceOf(Cluster);
        expect(subgraph).toBeInstanceOf(DotBase);
        expect(subgraph).toBeInstanceOf(GraphvizObject);
      });

      it('should be subgraph, when subgraph id is "test"', () => {
        subgraph = new Subgraph(g.context, 'test');
        expect(subgraph.isSubgraphCluster()).toBe(false);
      });

      it('should be subgraph cluster, when subgraph id is "cluster_test"', () => {
        subgraph = new Subgraph(g.context, 'cluster_test');
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
    });
  });
});
