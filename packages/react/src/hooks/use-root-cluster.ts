import { useContext } from 'react';
import { IRootCluster } from 'ts-graphviz';
import { RootCluster } from '../components/contexts/RootCluster';

export const useRootCluster = (): IRootCluster => useContext(RootCluster);
