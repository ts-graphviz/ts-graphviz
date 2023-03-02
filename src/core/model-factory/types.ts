import { RootGraphModel, GraphAttributesObject } from '../../common/index.js';

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
export interface ModelFactory {
  (id?: string, attributes?: GraphAttributesObject, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (attributes?: GraphAttributesObject, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (id?: string, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (callback?: (g: RootGraphModel) => void): RootGraphModel;
}

/**
 * @group Model Factory
 */
export interface ModelFactories {
  /**
   * API for creating directional graph objects.
   */
  digraph: ModelFactory;
  /**
   * API for creating omnidirectional graph objects.
   */
  graph: ModelFactory;
}

/**
 * @group Model Factory
 */
export interface ModelFactoriesWithStrict extends ModelFactories {
  strict: ModelFactories;
}
