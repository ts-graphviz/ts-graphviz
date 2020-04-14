import React, { FC, useEffect, useMemo } from 'react';
import { ClusterContext } from '../contexts/ClusterContext';
import { useCluster } from '../hooks/useCluster';

export const Subgraph: FC<{ id?: string }> = ({ children, id }) => {
  const cluster = useCluster();
  const subgraph = useMemo(() => cluster.createSubgraph(id), [cluster, id]);
  useEffect(() => {
    return () => {
      cluster.removeSubgraph(subgraph);
    };
  }, [cluster, subgraph]);
  return <ClusterContext.Provider value={subgraph}>{children}</ClusterContext.Provider>;
};

Subgraph.displayName = 'Subgraph';
