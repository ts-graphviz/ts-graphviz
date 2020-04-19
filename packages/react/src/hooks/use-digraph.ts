import { useMemo, useCallback, useEffect } from 'react';
import { IRootCluster, Digraph } from 'ts-graphviz';
import { useGraphvizContext } from './use-graphviz-context';
import { renderId } from '../utils/renderId';
import { ReactRootClusterAttributes } from '../types/attributes';

export type DigraphProps = {
  id?: string;
  comment?: string;
} & ReactRootClusterAttributes;

export const useDigraph = ({ id, comment, ...attributes }: DigraphProps): Digraph => {
  const context = useGraphvizContext();
  const apply = useCallback((g: IRootCluster, a: ReactRootClusterAttributes, clear = false) => {
    if (clear) {
      g.clear();
    }
    const { label, ...attrs } = a;
    if (label) {
      Object.assign(attrs, { label: renderId(label) });
    }
    g.apply(attrs);
  }, []);

  const digraph = useMemo(() => {
    const g = new Digraph(context, id);
    g.comment = comment;
    apply(g, attributes);
    return g;
  }, [context, id, comment, apply, attributes]);
  useEffect(() => {
    return (): void => {
      context.root = undefined;
    };
  }, [context]);

  useEffect(() => {
    apply(digraph, attributes, true);
  }, [digraph, attributes, apply]);

  useEffect(() => {
    digraph.comment = comment;
  }, [digraph, comment]);
  return digraph;
};
