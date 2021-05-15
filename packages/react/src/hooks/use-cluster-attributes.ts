import { ICluster, AttributesObject } from 'ts-graphviz';
import { useEffect } from 'react';
import { ClusterAttributesProps } from '../types';

export function useClusterAttributes<T extends string>(
  cluster: ICluster<T>,
  attributes: AttributesObject<T>,
  { edge, node, graph }: ClusterAttributesProps,
): void {
  useEffect(() => {
    cluster.clear();
    cluster.apply(attributes);
  }, [cluster, attributes]);
  useEffect(() => {
    cluster.attributes.node.clear();
    cluster.attributes.node.apply(node ?? {});
  }, [cluster, node]);

  useEffect(() => {
    cluster.attributes.edge.clear();
    cluster.attributes.edge.apply(edge ?? {});
  }, [cluster, edge]);

  useEffect(() => {
    cluster.attributes.graph.clear();
    cluster.attributes.graph.apply(graph ?? {});
  }, [cluster, graph]);
}
