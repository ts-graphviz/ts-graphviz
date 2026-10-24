import { useEffect, useMemo } from 'react';
import type { RootGraphModel } from 'ts-graphviz';
import type { RootGraphOptions } from '../types.js';
import { useGraphAttributes } from './useGraphAttributes.js';
import { useGraphvizContext } from './useGraphvizContext.js';
import { useHasComment } from './useHasComment.js';

/**
 * `useDigraph` is a hook that creates an instance of Digraph
 * according to the object given by props, using the model classes of the
 * current `GraphvizContext`.
 */
export function useDigraph(options: RootGraphOptions = {}): RootGraphModel {
  const { id, strict, comment, edge, node, graph, ...attributes } = options;
  const context = useGraphvizContext<RootGraphModel>();
  const digraph = useMemo(() => {
    const g = new context.models.Digraph(id, strict);
    g.with(context.models);
    context.container = g;
    return g;
  }, [context, id, strict]);
  useHasComment(digraph, comment);
  useGraphAttributes(digraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      context.container = undefined;
    };
  }, [context]);
  return digraph;
}
