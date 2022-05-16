import { useEffect, useMemo } from 'react';
import { EdgeTargetLikeTuple, IEdge, EdgeAttributes } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { EdgeTargetLengthErrorMessage } from '../utils/errors';
import { useHasComment } from './use-comment';
import { useHasAttributes } from './use-has-attributes';

export type EdgeProps = {
  targets: EdgeTargetLikeTuple;
  comment?: string;
} & EdgeAttributes;

export function useEdge({ targets, comment, ...attributes }: EdgeProps): IEdge {
  const cluster = useCluster();
  if (targets.length < 2) {
    throw Error(EdgeTargetLengthErrorMessage);
  }
  const edge = useMemo(() => {
    const e = cluster.createEdge(targets);
    e.comment = comment;
    e.attributes.apply(attributes);
    return e;
  }, [cluster, targets, comment, attributes]);
  useHasComment(edge, comment);
  useHasAttributes(edge, attributes);
  useEffect(
    () => (): void => {
      cluster.removeEdge(edge);
    },
    [cluster, edge],
  );
  return edge;
}
