import { useContext } from 'react';
import { IRootCluster } from 'ts-graphviz';
import { RootClusterContext } from '../components/contexts/RootClusterContext';

export const useRootCluster = (): IRootCluster => useContext(RootClusterContext);
