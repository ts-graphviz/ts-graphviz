import { useMemo, useEffect } from 'react';
import { Digraph, IRootCluster } from 'ts-graphviz';
import { useGraphvizContext } from './use-graphviz-context';
import { useClusterAttributes } from './use-cluster-attributes';
import { useHasComment } from './use-comment';
import { RootClusterProps } from '../types';

export function useDigraph({ id, comment, edge, node, graph, ...attributes }: RootClusterProps = {}): IRootCluster {
  const context = useGraphvizContext();
  const digraph = useMemo(() => {
    const g = new Digraph(id);
    context.root = g;
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
      context.root = undefined;
    };
  }, [context]);
  return digraph;
}
