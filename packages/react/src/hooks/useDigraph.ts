import { useEffect, useMemo } from 'react';
import { Digraph, type RootGraphModel } from 'ts-graphviz';
import type { RootGraphOptions } from '../types.js';
import { useGraphAttributes } from './useGraphAttributes.js';
import { useGraphvizContext } from './useGraphvizContext.js';
import { useHasComment } from './useHasComment.js';

/**
 * Hook that creates and manages a Digraph instance.
 *
 * @param options - The options for configuring the Digraph.
 * @returns The created Digraph instance.
 * @public
 */
export function useDigraph(options: RootGraphOptions = {}): RootGraphModel {
  const { id, comment, edge, node, graph, ...attributes } = options;
  const context = useGraphvizContext<RootGraphModel>();
  const digraph = useMemo(() => {
    const g = new Digraph(id);
    context.container = g;
    g.comment = comment;
    g.apply(attributes);
    g.attributes.node.apply(node ?? {});
    g.attributes.edge.apply(edge ?? {});
    g.attributes.graph.apply(graph ?? {});
    return g;
  }, [context, id, comment, edge, node, graph, attributes]);
  useHasComment(digraph, comment);
  useGraphAttributes(digraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      context.container = undefined;
    };
  }, [context]);
  return digraph;
}
