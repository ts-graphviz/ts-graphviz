import { useContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';
import { GraphMap } from '../contexts/GraphMap.js';

export function useGraphMap(): Map<string, AnyGraphContainer> {
  return useContext(GraphMap);
}
