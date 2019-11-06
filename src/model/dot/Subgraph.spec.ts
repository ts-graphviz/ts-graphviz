import { Subgraph } from './Cluster';

describe('Subgraph', () => {
  it('should be subgraph, when subgraph id is "test"', () => {
    const subgraph = new Subgraph('test');
    expect(subgraph.isSubgraphCluster()).toBe(false);
  });
});
