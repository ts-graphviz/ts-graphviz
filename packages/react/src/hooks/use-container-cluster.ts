import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { ContainerCluster } from '../contexts/ContainerCluster';

/**
 * Return the cluster of container.
 */
export function useContainerCluster(): GraphBaseModel | null {
  return useContext(ContainerCluster);
}
