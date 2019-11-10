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
    });
  });
});
