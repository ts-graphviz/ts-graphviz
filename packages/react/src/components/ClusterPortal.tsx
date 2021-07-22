import React, { FC, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CurrentCluster } from '../contexts/CurrentCluster';
import { ClusterMap } from '../contexts/ClusterMap';
import { useContainerCluster } from '../hooks/use-container-cluster';
import { ClusterPortalProps } from '../types';

/**
 * ClusterPortal component.
 */
export const ClusterPortal: FC<ClusterPortalProps> = ({ children, id }) => {
  const container = useContainerCluster();
  const map = useContext(ClusterMap);
  const cluster = useMemo(() => (id ? map.get(id) ?? container : container), [container, map, id]);
  return <CurrentCluster.Provider value={cluster}>{children}</CurrentCluster.Provider>;
};

ClusterPortal.displayName = 'ClusterPortal';
ClusterPortal.defaultProps = {
  id: undefined,
};

ClusterPortal.propTypes = {
  id: PropTypes.string,
};
