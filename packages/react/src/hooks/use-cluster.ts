import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { ClusterContext } from '../components/contexts/ClusterContext';

export const useCluster = <T extends string>(): ICluster<T> => useContext(ClusterContext);
