import { useContext } from 'react';
import { ICluster } from '@ts-graphviz/model';
import { Cluster } from '../components/contexts/Cluster';
import { NoClusterErrorMessage } from '../utils/errors';

export function useCluster(): ICluster {
  const cluster = useContext(Cluster);
  if (cluster === null) {
    throw Error(NoClusterErrorMessage);
  }
  return cluster;
}
