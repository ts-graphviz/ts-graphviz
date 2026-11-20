import type {
  GraphAttributesObject,
  ModelKit,
  ModelTypes,
  RootGraphModel,
} from '@ts-graphviz/common';
import type { DSL } from './dsl.js';

/**
 * The callback of a {@link ModelFactory}: it receives the graph's DSL.
 * @group Model Factory
 */
export type ModelFactoryCallback<
  G extends RootGraphModel = RootGraphModel,
  M extends ModelTypes = ModelTypes,
> = (g: DSL<G, M>) => void;

/**
 * ModelFactory creates a root graph and gives its DOT DSL ({@link DSL}).
 *
 * @param id - Optional string parameter that specifies the id of the graph.
 * @param attributes - Optional GraphAttributesObject parameter that specifies the attributes of the graph.
 * @param callback - Optional callback function that receives the graph's DSL.
 *
 * The arguments are read by position, in this order, and each may be left
 * out. A call that fits none of the signatures (two ids, an id after the
 * attributes) throws a `TypeError` with code `TSG_ERR_INVALID_ARGUMENTS`.
 *
 * @returns The graph's DSL. {@link modelOf} gives the {@link RootGraphModel}.
 * @typeParam G - The graph.
 * @typeParam M - The model types of the kit the graph is created with.
 * @group Model Factory
 */
export interface ModelFactory<
  G extends RootGraphModel = RootGraphModel,
  M extends ModelTypes = ModelTypes,
> {
  (
    id?: string,
    attributes?: GraphAttributesObject,
    callback?: ModelFactoryCallback<G, M>,
  ): DSL<G, M>;
  (
    attributes?: GraphAttributesObject,
    callback?: ModelFactoryCallback<G, M>,
  ): DSL<G, M>;
  (id?: string, callback?: ModelFactoryCallback<G, M>): DSL<G, M>;
  (callback?: ModelFactoryCallback<G, M>): DSL<G, M>;
}

/**
 * @group Model Factory
 */
export interface ModelFactories<M extends ModelTypes = ModelTypes> {
  /**
   * API for creating directional graph objects.
   */
  digraph: ModelFactory<M['Digraph'], M>;
  /**
   * API for creating omnidirectional graph objects.
   */
  graph: ModelFactory<M['Graph'], M>;
}

/**
 * @group Model Factory
 */
export interface ModelFactoriesWithStrict<M extends ModelTypes = ModelTypes>
  extends ModelFactories<M> {
  strict: ModelFactories<M>;
}
