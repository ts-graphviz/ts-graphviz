import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { ClusterContext } from '../contexts/ClusterContext';

export const useCluster = <T extends string>(): ICluster<T> => useContext(ClusterContext);
