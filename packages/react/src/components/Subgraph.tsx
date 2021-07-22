import React, { FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CurrentCluster } from '../contexts/CurrentCluster';
import { useSubgraph } from '../hooks/use-subgraph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useClusterMap } from '../hooks/use-cluster-map';
import { SubgraphProps } from '../types';
/**
 * `Subgraph` component.
 */
export const Subgraph: FC<SubgraphProps> = ({ children, label, ...options }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(options, { label: renderedLabel });
  const subgraph = useSubgraph(options);
  const clusters = useClusterMap();
  useEffect(() => {
    if (subgraph.id !== undefined) {
      clusters.set(subgraph.id, subgraph);
    }
  }, [subgraph, clusters]);
  return <CurrentCluster.Provider value={subgraph}>{children}</CurrentCluster.Provider>;
};

Subgraph.displayName = 'Subgraph';

Subgraph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

Subgraph.defaultProps = {
  id: undefined,
  comment: undefined,
  label: undefined,
};
