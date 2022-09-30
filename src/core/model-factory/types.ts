import { RootGraphModel, GraphAttributesObject } from '../../common/index.js';

/**
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
