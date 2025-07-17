import { useEffect, useMemo } from 'react';
import type { EdgeModel, EdgeTargetLikeTuple } from 'ts-graphviz';
import type { EdgeOptions } from '../types.js';
import { useCurrentGraph } from './useCurrentGraph.js';
import { useHasAttributes } from './useHasAttributes.js';
import { useHasComment } from './useHasComment.js';

/**
 * `useEdge` is a hook that creates an instance of Edge
 * according to the object given by props.
 */
export function useEdge(
  targets: EdgeTargetLikeTuple,
  props: EdgeOptions = {},
): EdgeModel {
  const { comment, ...attributes } = props;
  const cluster = useCurrentGraph();
  if (targets.length < 2) {
    throw Error('Edges must have at least 2 targets.');
  }

  const edge = useMemo(() => {
    const e = cluster.createEdge(targets);
    return e;
  }, [cluster, targets]);
  useHasComment(edge, comment);
  useHasAttributes(edge, attributes);
  useEffect(() => {
    return (): void => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
  return edge;
}
