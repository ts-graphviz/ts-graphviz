import { useEffect, useMemo } from 'react';
import { EdgeTargetLike, IEdge, EdgeAttributes } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { EdgeTargetLengthErrorMessage } from '../utils/errors';

export type EdgeProps = {
  targets: EdgeTargetLike[];
  comment?: string;
} & EdgeAttributes;

export const useEdge = ({ targets, comment, ...attributes }: EdgeProps): IEdge => {
  const cluster = useCluster();
  if (targets.length < 2) {
    throw Error(EdgeTargetLengthErrorMessage);
  }
  const edge = useMemo(() => {
    const e = cluster.createEdge(...targets);
    e.comment = comment;
    e.attributes.apply(attributes);
    return e;
  }, [cluster, targets, comment, attributes]);
  useEffect(() => {
    edge.attributes.clear();
    edge.attributes.apply(attributes);
  }, [edge, attributes]);

  useEffect(() => {
    edge.comment = comment;
  }, [edge, comment]);

  useEffect(() => {
    return (): void => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
  return edge;
};
