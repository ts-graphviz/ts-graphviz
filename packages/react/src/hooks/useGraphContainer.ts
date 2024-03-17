import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { GraphContainer } from '../contexts/GraphContainer.js';

/**
 * Return the cluster of container.
 */
export function useGraphContainer(): GraphBaseModel | null {
  return useContext(GraphContainer);
}
