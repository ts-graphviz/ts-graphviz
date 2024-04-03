import type {
  GraphAttributesObject,
  RootGraphModel,
} from '@ts-graphviz/common';

/**
 * ModelFactory is an interface that provides a way to create a {@link @ts-graphviz/common#RootGraphModel} object.
 *
 * @param id - Optional string parameter that specifies the id of the {@link @ts-graphviz/common#RootGraphModel} object.
 * @param attributes - Optional GraphAttributesObject parameter that specifies the attributes of the {@link @ts-graphviz/common#RootGraphModel} object.
 * @param callback - Optional callback function that takes a {@link @ts-graphviz/common#RootGraphModel} object as a parameter.
 *
 * @returns Returns a {@link @ts-graphviz/common#RootGraphModel} object.
 * @public
 */
export interface ModelFactory {
  (
    id?: string,
    attributes?: GraphAttributesObject,
    callback?: (g: RootGraphModel) => void,
  ): RootGraphModel;
  (
    attributes?: GraphAttributesObject,
    callback?: (g: RootGraphModel) => void,
  ): RootGraphModel;
  (id?: string, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (callback?: (g: RootGraphModel) => void): RootGraphModel;
}

/**
 * Collection of model factories for creating graph objects.
 * @public
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
 * Collection of model factories for creating graph objects with strict mode.
 * @public
 */
export interface ModelFactoriesWithStrict extends ModelFactories {
  strict: ModelFactories;
}
