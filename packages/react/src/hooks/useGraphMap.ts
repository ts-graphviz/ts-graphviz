import { useContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { GraphMap } from '../contexts/GraphMap.js';

export function useGraphMap(): Map<string, GraphBaseModel> {
  return useContext(GraphMap);
}
