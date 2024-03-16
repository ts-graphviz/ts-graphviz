import { FC, useEffect } from 'react';
import { ContainerCluster } from '../contexts/ContainerCluster.js';
import { CurrentCluster } from '../contexts/CurrentCluster.js';
import { useClusterMap } from '../hooks/use-cluster-map.js';
import { useContainerCluster } from '../hooks/use-container-cluster.js';
import { useDigraph } from '../hooks/use-digraph.js';
import { useRenderedID } from '../hooks/use-rendered-id.js';
import { RootGraphProps } from '../types.js';

/**
 * `Digraph` component.
 */
export const Digraph: FC<RootGraphProps> = ({
  children,
  label,
  ...options
}) => {
  const container = useContainerCluster();
  if (container !== null) {
    throw Error(
      'RootCluster is duplicated.\nUse only one of Digraph and Graph.',
    );
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const digraph = useDigraph(options);
  const clusters = useClusterMap();
  useEffect(() => {
    if (digraph.id !== undefined) {
      clusters.set(digraph.id, digraph);
    }
  }, [clusters, digraph]);
  return (
    <ContainerCluster.Provider value={digraph}>
      <CurrentCluster.Provider value={digraph}>
        {children}
      </CurrentCluster.Provider>
    </ContainerCluster.Provider>
  );
};

Digraph.displayName = 'Digraph';
