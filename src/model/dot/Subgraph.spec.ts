import { Subgraph } from './Cluster';

describe('Subgraph', () => {
  it('should be subgraph, when subgraph id is "test"', () => {
    const subgraph = new Subgraph('test');
    expect(subgraph.isSubgraphCluster()).toBe(false);
  });

  it('should be subgraph cluster, when subgraph id is "cluster_test"', () => {
    const subgraph = new Subgraph('cluster_test');
    expect(subgraph.isSubgraphCluster()).toBe(true);
  });
});
