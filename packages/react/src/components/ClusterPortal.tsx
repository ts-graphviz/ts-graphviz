import React, { FC, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Cluster } from '../contexts/Cluster';
import { ClusterMap } from '../contexts/ClusterMap';
import { useRootCluster } from '../hooks/use-root-cluster';
import { ClusterPortalComponentProps } from '../types';

export const ClusterPortal: FC<ClusterPortalComponentProps> = ({ children, name }) => {
  const root = useRootCluster();
  const map = useContext(ClusterMap);
  const cluster = useMemo(() => (name ? map.get(name) ?? root : root), [root, map, name]);
  return <Cluster.Provider value={cluster}>{children}</Cluster.Provider>;
};

ClusterPortal.displayName = 'ClusterPortal';
ClusterPortal.defaultProps = {
  name: undefined,
};

ClusterPortal.propTypes = {
  name: PropTypes.string,
};
