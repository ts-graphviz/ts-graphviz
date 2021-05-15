import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { Cluster, NoCluster } from '../components/contexts/Cluster';
import { NoClusterErrorMessage } from '../utils/errors';

export function useCluster(): ICluster {
  const cluster = useContext(Cluster);
  if (cluster === NoCluster) {
    throw Error(NoClusterErrorMessage);
  }
  return cluster;
}
