import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { ContainerCluster } from '../contexts/ContainerCluster';

/**
 * Return the cluster of container.
 */
export function useContainerCluster(): ICluster | null {
  return useContext(ContainerCluster);
}
