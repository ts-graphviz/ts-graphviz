import { useEffect, useMemo } from 'react';
import type { GraphBaseModel, SubgraphModel } from 'ts-graphviz';
import type { SubgraphOptions } from '../types.js';
import { useCurrentGraph } from './useCurrentGraph.js';
import { useGraphAttributes } from './useGraphAttributes.js';
import { useGraphvizContext } from './useGraphvizContext.js';
import { useHasComment } from './useHasComment.js';

/**
 * `useSubgraph` is a hook that creates an instance of Subgraph
 * according to the object given by props, using the model classes of the
 * enclosing graph (or of the `GraphvizContext` at the top level).
 */
export function useSubgraph(props: SubgraphOptions = {}): SubgraphModel {
  const { id, comment, edge, node, graph, ...attributes } = props;
  const context = useGraphvizContext();
  const cluster = useCurrentGraph();

  const subgraph = useMemo(() => {
    if (cluster !== null) {
      return cluster.createSubgraph(id);
    }
    const g = new context.models.Subgraph(id);
    g.with(context.models);
    if (!context.container) {
      // Type assertion: SubgraphModel extends GraphBaseModel
      context.container = g as GraphBaseModel;
    }
    return g;
  }, [context, cluster, id]);

  useHasComment(subgraph, comment);
  useGraphAttributes(subgraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      cluster?.removeSubgraph(subgraph);
    };
  }, [cluster, subgraph]);
  return subgraph;
}
