import { useEffect, useMemo } from 'react';
import { IEdge } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { EdgeTargetLengthErrorMessage } from '../errors';
import { useHasComment } from './use-comment';
import { useHasAttributes } from './use-has-attributes';
import { EdgeProps } from '../types';

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
  useEffect(() => {
    return (): void => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
  return edge;
}
