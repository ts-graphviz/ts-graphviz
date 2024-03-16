import { FC, useEffect } from 'react';
import { ContainerCluster } from '../contexts/ContainerCluster.js';
import { CurrentCluster } from '../contexts/CurrentCluster.js';
import { useClusterMap } from '../hooks/use-cluster-map.js';
import { useContainerCluster } from '../hooks/use-container-cluster.js';
import { useGraph } from '../hooks/use-graph.js';
import { useRenderedID } from '../hooks/use-rendered-id.js';
import { RootGraphProps } from '../types.js';
/**
 * `Graph` component.
 */
export const Graph: FC<RootGraphProps> = ({ children, label, ...options }) => {
  const container = useContainerCluster();
  if (container !== null) {
    throw Error(
      'RootCluster is duplicated.\nUse only one of Digraph and Graph.',
    );
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const graph = useGraph(options);
  const clusters = useClusterMap();
  useEffect(() => {
    if (graph.id !== undefined) {
      clusters.set(graph.id, graph);
    }
  }, [clusters, graph]);
  return (
    <ContainerCluster.Provider value={graph}>
      <CurrentCluster.Provider value={graph}>
        {children}
      </CurrentCluster.Provider>
    </ContainerCluster.Provider>
  );
};

Graph.displayName = 'Graph';
