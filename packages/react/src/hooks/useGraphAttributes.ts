import { useEffect } from 'react';
import { AttributeKey, AttributesObject, GraphBaseModel } from 'ts-graphviz';
import { GraphBaseAttributesProps } from '../types.js';

export function useGraphAttributes<T extends AttributeKey>(
  cluster: GraphBaseModel<T>,
  attributes: AttributesObject<T>,
  { edge, node, graph }: GraphBaseAttributesProps,
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
