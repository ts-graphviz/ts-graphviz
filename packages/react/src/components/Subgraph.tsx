import { FC, useEffect } from 'react';
import { CurrentCluster } from '../contexts/CurrentCluster.js';
import { useClusterMap } from '../hooks/use-cluster-map.js';
import { useRenderedID } from '../hooks/use-rendered-id.js';
import { useSubgraph } from '../hooks/use-subgraph.js';
import { SubgraphProps } from '../types.js';
/**
 * `Subgraph` component.
 */
export const Subgraph: FC<SubgraphProps> = ({
  children,
  label,
  ...options
}) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const subgraph = useSubgraph(options);
  const clusters = useClusterMap();
  useEffect(() => {
    if (subgraph.id !== undefined) {
      clusters.set(subgraph.id, subgraph);
    }
  }, [subgraph, clusters]);
  return (
    <CurrentCluster.Provider value={subgraph}>
      {children}
    </CurrentCluster.Provider>
  );
};

Subgraph.displayName = 'Subgraph';
