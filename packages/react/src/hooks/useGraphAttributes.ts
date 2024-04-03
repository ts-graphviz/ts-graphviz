import { useEffect } from 'react';
import type {
  AttributeKey,
  AttributesObject,
  GraphBaseModel,
} from 'ts-graphviz';
import type { GraphBaseAttributesProps } from '../types.js';

/**
 * Applies the specified attributes to the given graph cluster, node, and edge.
 * @typeParam T - The type of attribute keys.
 * @param cluster - The graph cluster to apply attributes to.
 * @param attributes - The attributes to apply to the cluster.
 * @param options - Additional options for applying attributes.
 * @public
 */
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
