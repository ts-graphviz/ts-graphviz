import React, { FC, useEffect, useMemo } from 'react';
import { attribute, EdgeTargetLike, IID } from 'ts-graphviz';
import { useCluster } from '../hooks/useCluster';

interface Props {
  targets: EdgeTargetLike[];
  attributes: {
    [key in Exclude<attribute.Edge, typeof attribute.label>]?: string | boolean | number | IID;
  };
  comment?: string;
}

export const Edge: FC<Props> = ({ children, targets, attributes, comment }) => {
  const cluster = useCluster();
  const edge = useMemo(() => cluster.createEdge(...targets), [cluster, targets]);
  useEffect(() => {
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
