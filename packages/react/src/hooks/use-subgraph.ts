import { useMemo, useEffect } from 'react';
import { ISubgraph, ClusterSubgraphAttributes } from 'ts-graphviz';
import { useCluster } from './use-cluster';

export type SubgraphProps = {
  id?: string;
  comment?: string;
} & ClusterSubgraphAttributes;

export const useSubgraph = ({ id, comment, ...attributes }: SubgraphProps = {}): ISubgraph => {
  const cluster = useCluster();
  const subgraph = useMemo(() => {
    const g = cluster.createSubgraph(id);
    g.comment = comment;
    g.apply(attributes);
    return g;
  }, [cluster, id, comment, attributes]);
  useEffect(() => {
    return (): void => {
      cluster.removeSubgraph(subgraph);
    };
  }, [cluster, subgraph]);
  useEffect(() => {
    subgraph.id = id;
  }, [subgraph, id]);

  useEffect(() => {
    subgraph.clear();
    subgraph.apply(attributes);
  }, [subgraph, attributes]);

  useEffect(() => {
    subgraph.comment = comment;
  }, [subgraph, comment]);
  return subgraph;
};
