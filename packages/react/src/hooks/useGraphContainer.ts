import { useContext } from 'react';
import { GraphContainer } from '../contexts/GraphContainer.js';
import type { AnyGraphContainer } from '../types/container.js';

/**
 * Return the cluster of container.
 */
export function useGraphContainer(): AnyGraphContainer | null {
  return useContext(GraphContainer);
}
