import type {
  GraphAttributesObject,
  ModelTypes,
  RootGraphModel,
} from '@ts-graphviz/common';
import type { DSL } from './dsl.js';

/**
 * ModelFactory creates a root graph and gives its DOT DSL ({@link DSL}).
 *
 * @param id - Optional string parameter that specifies the id of the graph.
 * @param attributes - Optional GraphAttributesObject parameter that specifies the attributes of the graph.
 * @param callback - Optional callback function that receives the graph's DSL.
 *
 * @returns The graph's DSL. {@link modelOf} gives the {@link RootGraphModel}.
 * @group Model Factory
 */
export interface ModelFactory<G extends RootGraphModel = RootGraphModel> {
  (
    id?: string,
    attributes?: GraphAttributesObject,
    callback?: (g: DSL<G>) => void,
  ): DSL<G>;
  (attributes?: GraphAttributesObject, callback?: (g: DSL<G>) => void): DSL<G>;
  (id?: string, callback?: (g: DSL<G>) => void): DSL<G>;
  (callback?: (g: DSL<G>) => void): DSL<G>;
}

/**
 * @group Model Factory
 */
export interface ModelFactories<M extends ModelTypes = ModelTypes> {
  /**
   * API for creating directional graph objects.
   */
  digraph: ModelFactory<M['Digraph']>;
  /**
   * API for creating omnidirectional graph objects.
   */
  graph: ModelFactory<M['Graph']>;
}

/**
 * @group Model Factory
 */
export interface ModelFactoriesWithStrict<M extends ModelTypes = ModelTypes>
  extends ModelFactories<M> {
  strict: ModelFactories<M>;
}
