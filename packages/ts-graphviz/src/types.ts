import type {
  GraphAttributesObject,
  ModelTypes,
  RootGraphModel,
} from '@ts-graphviz/common';

/**
 * ModelFactory is an interface that provides a way to create a {@link RootGraphModel} object.
 *
 * @param id - Optional string parameter that specifies the id of the {@link RootGraphModel} object.
 * @param attributes - Optional GraphAttributesObject parameter that specifies the attributes of the {@link RootGraphModel} object.
 * @param callback - Optional callback function that takes a {@link RootGraphModel} object as a parameter.
 *
 * @returns {@link RootGraphModel} - Returns a {@link RootGraphModel} object.
 * @group Model Factory
 */
export interface ModelFactory<G extends RootGraphModel = RootGraphModel> {
  (
    id?: string,
    attributes?: GraphAttributesObject,
    callback?: (g: G) => void,
  ): G;
  (attributes?: GraphAttributesObject, callback?: (g: G) => void): G;
  (id?: string, callback?: (g: G) => void): G;
  (callback?: (g: G) => void): G;
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
