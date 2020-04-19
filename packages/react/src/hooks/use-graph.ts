import { useMemo, useEffect } from 'react';
import { Graph, RootClusterAttributes } from 'ts-graphviz';
import { useGraphvizContext } from './use-graphviz-context';

export type GraphProps = {
  id?: string;
  comment?: string;
} & RootClusterAttributes;

export const useGraph = ({ id, comment, ...attributes }: GraphProps): Graph => {
  const context = useGraphvizContext();
  const graph = useMemo(() => {
    const g = new Graph(context, id);
    g.comment = comment;
    g.apply(attributes);
    return g;
  }, [context, id, comment, attributes]);
  useEffect(() => {
    return (): void => {
      context.root = undefined;
    };
  }, [context]);

  useEffect(() => {
    graph.clear();
    graph.apply(attributes);
  }, [graph, attributes]);

  useEffect(() => {
    graph.comment = comment;
  }, [graph, comment]);
  return graph;
};
