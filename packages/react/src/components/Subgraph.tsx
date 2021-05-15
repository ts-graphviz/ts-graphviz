import React, { FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Cluster } from '../contexts/Cluster';
import { useSubgraph } from '../hooks/use-subgraph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useClusterMap } from '../hooks/use-cluster-map';
import { SubgraphComponentProps } from '../types';

export const Subgraph: FC<SubgraphComponentProps> = ({ children, label, ...props }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  const subgraph = useSubgraph(props);
  const clusters = useClusterMap();
  useEffect(() => {
    if (subgraph.id !== undefined) {
      clusters.set(subgraph.id, subgraph);
    }
  }, [subgraph, clusters]);
  return <Cluster.Provider value={subgraph}>{children}</Cluster.Provider>;
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
