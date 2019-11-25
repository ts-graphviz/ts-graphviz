import { useContext } from 'react';
import { ClusterContext } from '../contexts/ClusterContext';
export function useCluster() {
  return useContext(ClusterContext);
}
