import { useMemo, useCallback, useEffect } from 'react';
import { IRootCluster, Graph } from 'ts-graphviz';
import { useGraphvizContext } from './use-context';
import { renderId } from '../utils/renderId';
import { ReactRootClusterAttributes } from '../types/attributes';

export type GraphProps = {
  id?: string;
  comment?: string;
} & ReactRootClusterAttributes;

export const useGraph = ({ id, comment, ...attributes }: GraphProps): { graph: Graph } => {
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

  const graph = useMemo(() => {
    const g = new Graph(context, id);
    g.comment = comment;
    apply(g, attributes);
    return g;
  }, [context, id, comment, attributes]);
  useEffect(() => {
    return (): void => {
      context.root = undefined;
    };
  }, [context]);

  useEffect(() => {
    apply(graph, attributes, true);
  }, [graph, attributes]);

  useEffect(() => {
    graph.comment = comment;
  }, [graph, comment]);
  return { graph };
};
