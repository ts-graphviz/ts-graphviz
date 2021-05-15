import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { Cluster } from '../contexts/Cluster';
import { NoClusterErrorMessage } from '../errors';

export function useCluster(): ICluster {
  const cluster = useContext(Cluster);
  if (cluster === null) {
    throw Error(NoClusterErrorMessage);
  }
  return cluster;
}
