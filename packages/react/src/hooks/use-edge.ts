import { useEffect, useMemo } from 'react';
import { EdgeTargetLike, EdgeTargetsLike, IEdge } from 'ts-graphviz';
import { useCurrentCluster } from './use-current-cluster';
import { EdgeTargetLengthErrorMessage } from '../errors';
import { useHasComment } from './use-comment';
import { useHasAttributes } from './use-has-attributes';
import { EdgeOptions } from '../types';

/**
 * `useEdge` is a hook that creates an instance of Edge
 * according to the object given by props.
 */
export function useEdge(targets: (EdgeTargetLike | EdgeTargetsLike)[], props: EdgeOptions = {}): IEdge {
  const { comment, ...attributes } = props;
  const cluster = useCurrentCluster();
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
