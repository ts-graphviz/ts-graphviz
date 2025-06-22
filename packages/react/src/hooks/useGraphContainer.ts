import { useContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';
import { GraphContainer } from '../contexts/GraphContainer.js';

/**
 * Return the cluster of container.
 */
export function useGraphContainer(): AnyGraphContainer | null {
  return useContext(GraphContainer);
}
