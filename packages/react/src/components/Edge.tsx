import React, { FC, useEffect, useMemo } from 'react';
import { EdgeAttributes, EdgeTargetLike } from 'ts-graphviz';
import { useCluster } from '../hooks/useCluster';

type Props = {
  targets: EdgeTargetLike[];
  comment?: string;
} & EdgeAttributes;

export const Edge: FC<Props> = ({ children, targets, comment, ...attributes }) => {
  const cluster = useCluster();
  const edge = useMemo(() => cluster.createEdge(...targets), [cluster, targets]);
  useEffect(() => {
    edge.attributes.clear();
    edge.attributes.apply(attributes);
  }, [edge, attributes]);

  useEffect(() => {
    edge.comment = comment;
  }, [edge, comment]);

  useEffect(() => {
    return () => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
  return <>{children}</>;
};

Edge.displayName = 'Edge';
