import { useContext } from 'react';
import { ICluster } from '@ts-graphviz/model';
import { ClusterMap } from '../components/contexts/ClusterMap';

export function useClusterMap(): Map<string, ICluster> {
  return useContext(ClusterMap);
}
