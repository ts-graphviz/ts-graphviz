import { useEffect, useMemo } from 'react';
import { EdgeModel, EdgeTargetLikeTuple } from 'ts-graphviz';
import { EdgeOptions } from '../types.js';
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
