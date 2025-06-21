import { useLayoutEffect } from 'react';
import type {
  AttributeKey,
  AttributesObject,
  GraphBaseModel,
} from 'ts-graphviz';
import type { GraphBaseAttributesProps } from '../types.js';

export function useGraphAttributes<T extends AttributeKey>(
  cluster: GraphBaseModel<T>,
  attributes: AttributesObject<T>,
  { edge, node, graph }: GraphBaseAttributesProps,
): void {
  useLayoutEffect(() => {
    cluster.clear();
    cluster.apply(attributes);
  }, [cluster, attributes]);
  useLayoutEffect(() => {
    cluster.attributes.node.clear();
    cluster.attributes.node.apply(node ?? {});
  }, [cluster, node]);

  useLayoutEffect(() => {
    cluster.attributes.edge.clear();
    cluster.attributes.edge.apply(edge ?? {});
  }, [cluster, edge]);

  useLayoutEffect(() => {
    cluster.attributes.graph.clear();
    cluster.attributes.graph.apply(graph ?? {});
  }, [cluster, graph]);
}
