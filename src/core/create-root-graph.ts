import {
  RootGraphModel,
  GraphAttributesObject,
  ModelsContext,
  RootModelsContext,
  createModelsContext,
} from '#lib/common';

/**
 * @group Model Builder
 */
export interface CreateRootGraph {
  (id?: string, attributes?: GraphAttributesObject, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (attributes?: GraphAttributesObject, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (id?: string, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (callback?: (g: RootGraphModel) => void): RootGraphModel;
  /**
   * @alpha
   */
  with(
    models: Partial<ModelsContext>,
    id?: string,
    attributes?: GraphAttributesObject,
    callback?: (g: RootGraphModel) => void,
  ): RootGraphModel;
  /**
   * @alpha
   */
  with(
    models: Partial<ModelsContext>,
    attributes?: GraphAttributesObject,
    callback?: (g: RootGraphModel) => void,
  ): RootGraphModel;
  /**
   * @alpha
   */
  with(models: Partial<ModelsContext>, id?: string, callback?: (g: RootGraphModel) => void): RootGraphModel;
  /**
   * @alpha
   */
  with(models: Partial<ModelsContext>, callback?: (g: RootGraphModel) => void): RootGraphModel;
}

/** @hidden */
function builder(this: ModelsContext, directed: boolean, strictMode: boolean): CreateRootGraph {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let $$models: ModelsContext = this;
  const f = function (...args: unknown[]) {
    const G = directed ? $$models.Digraph : $$models.Graph;
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is GraphAttributesObject => typeof arg === 'object');
    const callback = args.find((arg): arg is (g: RootGraphModel) => void => typeof arg === 'function');
    const g = new G(id, strictMode, attributes);
    g.with($$models);
    if (typeof callback === 'function') {
      callback(g);
    }
    return g;
  };

  f.with = function (models: Partial<ModelsContext>, ...args: unknown[]) {
    $$models = createModelsContext(models);
    return this(...args);
  };
  return f;
}

/**
 * API for creating directional graph objects.
 * @group Model Builder
 */
export const digraph = builder.call(RootModelsContext, true, false);

/**
 * API for creating omnidirectional graph objects.
 * @group Model Builder
 */
export const graph = builder.call(RootModelsContext, false, false);

/**
 * Provides a strict mode API.
 * @group Model Builder
 */
export const strict: { digraph: CreateRootGraph; graph: CreateRootGraph } = Object.freeze({
  /**
   * API for creating directional graph objects in strict mode.
   * @group Model Builder
   */
  digraph: builder.call(RootModelsContext, true, true),
  /**
   * API for creating omnidirectional graph objects in strict mode.
   * @group Model Builder
   */
  graph: builder.call(RootModelsContext, false, true),
});
