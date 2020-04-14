import React, { FC, useEffect, useMemo } from 'react';
import { ClusterContext } from '../contexts/ClusterContext';
import { useCluster } from '../hooks/useCluster';

interface Props {
  id?: string;
  comment?: string;
}

export const Subgraph: FC<Props> = ({ children, id, comment }) => {
  const cluster = useCluster();
  const subgraph = useMemo(() => cluster.createSubgraph(id), [cluster, id]);
  useEffect(() => {
    return () => {
      cluster.removeSubgraph(subgraph);
    };
  }, [cluster, subgraph]);

  useEffect(() => {
    cluster.comment = comment;
  }, [cluster, comment]);
  return <ClusterContext.Provider value={subgraph}>{children}</ClusterContext.Provider>;
};

Subgraph.displayName = 'Subgraph';
