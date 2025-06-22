import { useContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';
import { CurrentGraph } from '../contexts/CurrentGraph.js';

/**
 * Hook to get the current cluster(Digraph, Graph or Subgraph).
 *
 * @throws If it is out of the context of Cluster, it throws an exception.
 */
export function useCurrentGraph(): AnyGraphContainer {
  const cluster = useContext(CurrentGraph);
  if (cluster === null) {
    throw Error(
      'useCurrentGraph must be called within a cluster such as Digraph, Graph, Subgraph.',
    );
  }
  return cluster;
}
