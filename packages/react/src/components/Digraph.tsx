import React, { FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RootCluster } from '../contexts/RootCluster';
import { Cluster } from '../contexts/Cluster';
import { useDigraph } from '../hooks/use-digraph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useRootCluster } from '../hooks/use-root-cluster';
import { DuplicatedRootClusterErrorMessage } from '../errors';
import { useClusterMap } from '../hooks/use-cluster-map';
import { RootClusterComponentProps } from '../types';

export const Digraph: FC<RootClusterComponentProps> = ({ children, label, ...props }) => {
  const root = useRootCluster();
  if (root !== null) {
    throw Error(DuplicatedRootClusterErrorMessage);
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  const digraph = useDigraph(props);
  const clusters = useClusterMap();
  useEffect(() => {
    if (digraph.id !== undefined) {
      clusters.set(digraph.id, digraph);
    }
  }, [clusters, digraph]);
  return (
    <RootCluster.Provider value={digraph}>
      <Cluster.Provider value={digraph}>{children}</Cluster.Provider>
    </RootCluster.Provider>
  );
};

Digraph.displayName = 'Digraph';

Digraph.defaultProps = {
  id: undefined,
  comment: undefined,
  label: undefined,
};

Digraph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};
