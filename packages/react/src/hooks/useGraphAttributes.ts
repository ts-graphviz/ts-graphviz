import { useLayoutEffect } from 'react';
import type {
  AttributeKey,
  AttributesObject,
  DotObjectType,
  GraphAttributesObject,
  GraphBaseModel,
  RootGraphModel,
  SubgraphAttributesObject,
  SubgraphModel,
} from 'ts-graphviz';
import type { GraphBaseAttributesProps } from '../types.js';

// Function overloads for specific graph types to avoid type assertions
export function useGraphAttributes(
  cluster: RootGraphModel,
  attributes: GraphAttributesObject,
  props: GraphBaseAttributesProps,
): void;
export function useGraphAttributes(
  cluster: SubgraphModel,
  attributes: SubgraphAttributesObject,
  props: GraphBaseAttributesProps,
): void;
export function useGraphAttributes<
  T extends DotObjectType,
  K extends AttributeKey,
>(
  cluster: GraphBaseModel<T, K>,
  attributes: AttributesObject<K>,
  props: GraphBaseAttributesProps,
): void;
export function useGraphAttributes<
  T extends DotObjectType,
  K extends AttributeKey,
>(
  cluster: GraphBaseModel<T, K>,
  attributes: AttributesObject<K>,
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
