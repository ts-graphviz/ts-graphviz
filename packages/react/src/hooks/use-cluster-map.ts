import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { ClusterMap } from '../contexts/ClusterMap.js';

export function useClusterMap(): Map<string, GraphBaseModel> {
  return useContext(ClusterMap);
}
