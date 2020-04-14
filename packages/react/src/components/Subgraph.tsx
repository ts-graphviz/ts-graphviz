import React, { FC } from 'react';
import { ClusterContext } from '../contexts/ClusterContext';
import { useCluster } from '../hooks/useCluster';

export const Subgraph: FC<{ id?: string }> = ({ children, id }) => {
  const cluster = useCluster();
  const subgraph = cluster.createSubgraph(id);
  return <ClusterContext.Provider value={subgraph}>{children}</ClusterContext.Provider>;
};

Subgraph.displayName = 'Subgraph';
