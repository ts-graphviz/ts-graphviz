import { useContext } from 'react';
import { GraphMap } from '../contexts/GraphMap.js';
import type { AnyGraphContainer } from '../types/container.js';

export function useGraphMap(): Map<string, AnyGraphContainer> {
  return useContext(GraphMap);
}
