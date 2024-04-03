import { useContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { GraphMap } from '../contexts/GraphMap.js';

/**
 * Hook that returns the graph map from the React context.
 * The graph map is a Map object that maps string keys to GraphBaseModel values.
 *
 * @returns The graph map from the React context.
 * @public
 */
export function useGraphMap(): Map<string, GraphBaseModel> {
  return useContext(GraphMap);
}
