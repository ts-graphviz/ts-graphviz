import { GraphAttributesObject, RootGraphModel, Digraph, Graph } from '../model/index.js';

interface CreateRootGraph {
  (id?: string, attributes?: GraphAttributesObject, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (attributes?: GraphAttributesObject, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (id?: string, callback?: (g: RootGraphModel) => void): RootGraphModel;
  (callback?: (g: RootGraphModel) => void): RootGraphModel;
}

/** @hidden */
function builder(directed: boolean, strictMode: boolean): CreateRootGraph {
  return (...args: unknown[]) => {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is GraphAttributesObject => typeof arg === 'object');
    const callback = args.find((arg): arg is (g: RootGraphModel) => void => typeof arg === 'function');
    const C = directed ? Digraph : Graph;
    const g = new C(id, strictMode, attributes);
    if (typeof callback === 'function') {
      callback(g);
    }
    return g;
  };
}

/** API for creating directional graph objects. */
export const digraph = builder(true, false);

/** API for creating omnidirectional graph objects. */
export const graph = builder(false, false);

/** Provides a strict mode API. */
export const strict = Object.freeze({
  /** API for creating directional graph objects in strict mode. */
  digraph: builder(true, true),
  /** API for creating omnidirectional graph objects in strict mode. */
  graph: builder(false, true),
});
