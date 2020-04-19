import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { Cluster } from '../components/contexts/Cluster';

export const useCluster = <T extends string>(): ICluster<T> => useContext(Cluster);
