import { useEffect, useMemo } from 'react';
import { Graph, type RootGraphModel } from 'ts-graphviz';
import type { RootGraphOptions } from '../types.js';
import { useGraphAttributes } from './useGraphAttributes.js';
import { useGraphvizContext } from './useGraphvizContext.js';
import { useHasComment } from './useHasComment.js';

/**
 * `useGraph` is a hook that creates an instance of Graph
 * according to the object given by props.
 */
export function useGraph(options: RootGraphOptions = {}): RootGraphModel {
  const { id, comment, edge, node, graph, ...attributes } = options;
  const context = useGraphvizContext<RootGraphModel>();

  const memoGraph = useMemo(() => {
    const g = new Graph(id);
    context.container = g;
    return g;
  }, [context, id]);

  useHasComment(memoGraph, comment);
  useGraphAttributes(memoGraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      context.container = undefined;
    };
  }, [context]);
  return memoGraph;
}
