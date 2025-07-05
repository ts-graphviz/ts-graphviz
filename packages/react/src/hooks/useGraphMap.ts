import { useContext } from 'react';
import { GraphMap } from '../contexts/GraphMap.js';
import type { AnyGraphContainer } from '../types/container.js';

export function useGraphMap(): Map<string, AnyGraphContainer> {
  const graphMap = useContext(GraphMap);
  if (graphMap === null) {
    throw new Error(
      'useGraphMap must be called within a GraphMap provider. This usually means you are calling it outside of a Graphviz root context.',
    );
  }
  return graphMap;
}
