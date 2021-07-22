import { useMemo, useEffect } from 'react';
import { Subgraph, ISubgraph } from 'ts-graphviz';
import { SubgraphOptions } from '../types';
import { useCurrentCluster } from './use-current-cluster';
import { useClusterAttributes } from './use-cluster-attributes';
import { useHasComment } from './use-comment';
import { useGraphvizContext } from './use-graphviz-context';

/**
 * `useSubgraph` is a hook that creates an instance of Subgraph
 * according to the object given by props.
 */
export function useSubgraph(props: SubgraphOptions = {}): ISubgraph {
  const { id, comment, edge, node, graph, ...attributes } = props;
  const context = useGraphvizContext();
  const cluster = useCurrentCluster();
  const subgraph = useMemo(() => {
    const g = new Subgraph(id);
    if (cluster !== null) {
      cluster.addSubgraph(g);
    } else if (!context.container) {
      context.container = g;
    }
    g.comment = comment;
    g.apply(attributes);
    g.attributes.node.apply(node ?? {});
    g.attributes.edge.apply(edge ?? {});
    g.attributes.graph.apply(graph ?? {});
    return g;
  }, [context, cluster, id, comment, edge, node, graph, attributes]);
  useHasComment(subgraph, comment);
  useClusterAttributes(subgraph, attributes, { edge, node, graph });
  useEffect(() => {
    return (): void => {
      cluster.removeSubgraph(subgraph);
    };
  }, [cluster, subgraph]);
  return subgraph;
}
