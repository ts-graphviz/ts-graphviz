import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { GraphMap } from '../contexts/GraphMap.js';

export function useGraphMap(): Map<string, GraphBaseModel> {
  return useContext(GraphMap);
}
