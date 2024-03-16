import { FC, useContext, useMemo } from 'react';
import { ClusterMap } from '../contexts/ClusterMap.js';
import { CurrentCluster } from '../contexts/CurrentCluster.js';
import { useContainerCluster } from '../hooks/use-container-cluster.js';
import { ClusterPortalProps } from '../types.js';

/**
 * ClusterPortal component.
 */
export const ClusterPortal: FC<ClusterPortalProps> = ({ children, id }) => {
  const container = useContainerCluster();
  const map = useContext(ClusterMap);
  const cluster = useMemo(
    () => (id ? map.get(id) ?? container : container),
    [container, map, id],
  );
  return (
    <CurrentCluster.Provider value={cluster}>
      {children}
    </CurrentCluster.Provider>
  );
};

ClusterPortal.displayName = 'ClusterPortal';
