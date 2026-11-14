import { withCode } from '@ts-graphviz/common';
import { useContext } from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import type { AnyGraphContainer } from '../types/container.js';

/**
 * Hook to get the current cluster(Digraph, Graph or Subgraph).
 *
 * @throws `Error` with `code` `TSG_ERR_NO_CURRENT_GRAPH` when called outside a
 * Digraph, Graph or Subgraph.
 */
export function useCurrentGraph(): AnyGraphContainer {
  const cluster = useContext(CurrentGraph);
  if (cluster === null) {
    throw withCode(
      new Error(
        'useCurrentGraph must be called within a cluster such as Digraph, Graph, Subgraph.',
      ),
      'TSG_ERR_NO_CURRENT_GRAPH',
    );
  }
  return cluster;
}
