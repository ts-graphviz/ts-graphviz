import {
  EdgeAttributes,
  NodeAttributes,
  ClusterSubgraphAttributes,
  ICluster,
  AttributesObject,
  AttributeKey,
} from 'ts-graphviz';
import { useEffect } from 'react';

export type ClusterAttributesProps = {
  edge?: EdgeAttributes;
  node?: NodeAttributes;
  graph?: ClusterSubgraphAttributes;
};

export function useClusterAttributes<T extends AttributeKey>(
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
