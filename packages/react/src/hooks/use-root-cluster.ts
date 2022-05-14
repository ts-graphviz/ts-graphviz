import { useContext } from 'react';
import { IRootCluster } from 'ts-graphviz';
import { RootCluster } from '../components/contexts/RootCluster';

export function useRootCluster(): IRootCluster {
  return useContext(RootCluster);
}
