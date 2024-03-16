import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { CurrentCluster } from '../contexts/CurrentCluster.js';

/**
 * Hook to get the current cluster(Digraph, Graph or Subgraph).
 *
 * @throws If it is out of the context of Cluster, it throws an exception.
 */
export function useCurrentCluster(): GraphBaseModel {
  const cluster = useContext(CurrentCluster);
  if (cluster === null) {
    throw Error(
      'useCluster must be called within a cluster such as Digraph, Graph, Subgraph.',
    );
  }
  return cluster;
}
