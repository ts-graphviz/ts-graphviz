import React, { FC } from 'react';
import { ClusterContext } from '../contexts/ClusterContext';
import { useCluster } from '../hooks/useCluster';

export const Subgraph: FC<{ id: string }> = ({ children, id }) => {
  const cluster = useCluster();
  const subgraph = cluster.createSubgraph(id);
  // console.log({ subgraph, cluster });
  return <ClusterContext.Provider value={subgraph}>{children}</ClusterContext.Provider>;
};
