import { useMemo, useEffect } from 'react';
import { Digraph, RootClusterAttributes } from 'ts-graphviz';
import { useGraphvizContext } from './use-graphviz-context';

export type DigraphProps = {
  id?: string;
  comment?: string;
} & RootClusterAttributes;

export const useDigraph = ({ id, comment, ...attributes }: DigraphProps): Digraph => {
  const context = useGraphvizContext();
  const digraph = useMemo(() => {
    const g = new Digraph(context, id);
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
    digraph.clear();
    digraph.apply(attributes);
  }, [digraph, attributes]);

  useEffect(() => {
    digraph.comment = comment;
  }, [digraph, comment]);
  return digraph;
};
