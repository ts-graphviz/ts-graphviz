import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { CurrentCluster } from '../contexts/CurrentCluster';
import { NoClusterErrorMessage } from '../errors';

/**
 * Hook to get the current cluster(Digraph, Graph or Subgraph).
 *
 * @throws If it is out of the context of Cluster, it throws an exception.
 */
export function useCurrentCluster(): GraphBaseModel {
  const cluster = useContext(CurrentCluster);
  if (cluster === null) {
    throw Error(NoClusterErrorMessage);
  }
  return cluster;
}
