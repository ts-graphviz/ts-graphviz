import { useEffect } from 'react';
import { AttributeKey, AttributesObject, GraphBaseModel } from 'ts-graphviz';
import { ClusterCommonAttributesProps } from '../types.js';

export function useClusterAttributes<T extends AttributeKey>(
  cluster: GraphBaseModel<T>,
  attributes: AttributesObject<T>,
  { edge, node, graph }: ClusterCommonAttributesProps,
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
