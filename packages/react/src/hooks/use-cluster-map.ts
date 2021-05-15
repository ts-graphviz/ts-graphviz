import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { ClusterMap } from '../components/contexts/ClusterMap';

export function useClusterMap(): Map<string, ICluster> {
  return useContext(ClusterMap);
}
