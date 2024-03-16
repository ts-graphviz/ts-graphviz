import { useEffect, useMemo } from 'react';
import { Graph, RootGraphModel } from 'ts-graphviz';
import { RootGraphOptions } from '../types.js';
import { useClusterAttributes } from './use-cluster-attributes.js';
import { useHasComment } from './use-comment.js';
import { useGraphvizContext } from './use-graphviz-context.js';

/**
 * `useGraph` is a hook that creates an instance of Graph
 * according to the object given by props.
 */
export function useGraph(options: RootGraphOptions = {}): RootGraphModel {
  const { id, comment, edge, node, graph, ...attributes } = options;
  const context = useGraphvizContext();
  const memoGraph = useMemo(() => {
    const g = new Graph(id);
    context.container = g;
    g.comment = comment;
    g.apply(attributes);
    g.attributes.node.apply(node ?? {});
    g.attributes.edge.apply(edge ?? {});
    g.attributes.graph.apply(graph ?? {});
    return g;
  }, [context, id, comment, edge, node, graph, attributes]);
  useHasComment(memoGraph, comment);
  useClusterAttributes(memoGraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      context.container = undefined;
    };
  }, [context]);
  return memoGraph;
}
