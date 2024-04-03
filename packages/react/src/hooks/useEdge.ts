import { useEffect, useMemo } from 'react';
import type { EdgeModel, EdgeTargetLikeTuple } from 'ts-graphviz';
import type { EdgeOptions } from '../types.js';
import { useCurrentGraph } from './useCurrentGraph.js';
import { useHasAttributes } from './useHasAttributes.js';
import { useHasComment } from './useHasComment.js';

/**
 * Creates and manages an edge in the graph.
 *
 * @param targets - The targets of the edge.
 * @param props - The optional edge options.
 * @returns The created edge model.
 * @throws Error if the number of targets is less than 2.
 * @public
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
