import { useMemo, useEffect } from 'react';
import { Digraph, IRootCluster } from 'ts-graphviz';
import { useGraphvizContext } from './use-graphviz-context';
import { useClusterAttributes } from './use-cluster-attributes';
import { useHasComment } from './use-comment';
import { RootClusterOptions } from '../types';

/**
 * `useDigraph` is a hook that creates an instance of Digraph
 * according to the object given by props.
 */
export function useDigraph(options: RootClusterOptions = {}): IRootCluster {
  const { id, comment, edge, node, graph, ...attributes } = options;
  const context = useGraphvizContext();
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
  useClusterAttributes(digraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      context.container = undefined;
    };
  }, [context]);
  return digraph;
}
