import React, { FC, useEffect, useMemo } from 'react';
import { EdgeTargetLike } from 'ts-graphviz';
import { useCluster } from '../hooks/useCluster';

export const Edge: FC<{ targets: EdgeTargetLike[] }> = ({ children, targets }) => {
  const cluster = useCluster();
  const edge = useMemo(() => cluster.createEdge(...targets), [cluster, targets]);
  useEffect(() => {
    return () => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
  return <>{children}</>;
};

Edge.displayName = 'Edge';
