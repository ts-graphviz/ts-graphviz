import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { ClusterContext } from '../contexts/ClusterContext';

export function useCluster<T extends string>(): ICluster<T> {
  return useContext(ClusterContext);
}
