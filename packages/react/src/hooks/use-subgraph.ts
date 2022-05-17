import { useMemo, useEffect } from 'react';
import { ISubgraph, ClusterSubgraphAttributes } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { useClusterAttributes, ClusterAttributesProps } from './use-cluster-attributes';
import { useHasComment } from './use-comment';

export type SubgraphProps = {
  id?: string;
  comment?: string;
} & ClusterSubgraphAttributes &
  ClusterAttributesProps;

export function useSubgraph({ id, comment, edge, node, graph, ...attributes }: SubgraphProps = {}): ISubgraph {
  const cluster = useCluster();
  const subgraph = useMemo(() => {
    const g = cluster.createSubgraph(id);
    g.comment = comment;
    g.apply(attributes);
    g.attributes.node.apply(node ?? {});
    g.attributes.edge.apply(edge ?? {});
    g.attributes.graph.apply(graph ?? {});
    return g;
  }, [cluster, id, comment, edge, node, graph, attributes]);
  useHasComment(subgraph, comment);
  useClusterAttributes(subgraph, attributes, { edge, node, graph });
  useEffect(
    () => (): void => {
      cluster.removeSubgraph(subgraph);
    },
    [cluster, subgraph],
  );
  return subgraph;
}
