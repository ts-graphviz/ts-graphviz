import { useMemo, useEffect } from 'react';
import { Digraph, RootClusterAttributes } from 'ts-graphviz';
import { useGraphvizContext } from './use-graphviz-context';
import { useClusterAttributes, ClusterAttributesProps } from './use-cluster-attributes';
import { useHasComment } from './use-comment';

export type DigraphProps = {
  id?: string;
  comment?: string;
} & RootClusterAttributes &
  ClusterAttributesProps;

export const useDigraph = ({ id, comment, edge, node, graph, ...attributes }: DigraphProps = {}): Digraph => {
  const context = useGraphvizContext();
  const digraph = useMemo(() => {
    const g = new Digraph(context, id);
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
};
