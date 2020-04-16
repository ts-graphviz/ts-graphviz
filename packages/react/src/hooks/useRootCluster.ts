import { useContext } from 'react';
import { IRootCluster } from 'ts-graphviz';
import { RootClusterContext } from '../contexts/RootClusterContext';

export function useRootCluster(): IRootCluster {
  return useContext(RootClusterContext);
}
