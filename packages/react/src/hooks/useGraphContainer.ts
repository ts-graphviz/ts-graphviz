import { useContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { GraphContainer } from '../contexts/GraphContainer.js';

/**
 * Hook that returns the graph container from the React context.
 * @returns The graph container object or null if not found.
 * @public
 */
export function useGraphContainer(): GraphBaseModel | null {
  return useContext(GraphContainer);
}
