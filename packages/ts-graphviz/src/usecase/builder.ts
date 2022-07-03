import { Graph, GraphAttributes } from '@ts-graphviz/model';

interface CreateRootFunction {
  (id?: string, attributes?: GraphAttributes, callback?: (g: Graph) => void): Graph;
  (attributes?: GraphAttributes, callback?: (g: Graph) => void): Graph;
  (id?: string, callback?: (g: Graph) => void): Graph;
  (callback?: (g: Graph) => void): Graph;
}

/** @hidden */
function builder(directed: boolean, strictMode = false): CreateRootFunction {
  function createRoot(id?: string, attributes?: GraphAttributes, callback?: (g: Graph) => void): Graph;
  function createRoot(attributes?: GraphAttributes, callback?: (g: Graph) => void): Graph;
  function createRoot(id?: string, callback?: (g: Graph) => void): Graph;
  function createRoot(callback?: (g: Graph) => void): Graph;
  function createRoot(...args: unknown[]): Graph {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is GraphAttributes => typeof arg === 'object');
    const callback = args.find((arg): arg is (g: Graph) => void => typeof arg === 'function');
    const g = new Graph(directed, id, strictMode, attributes);
    if (typeof callback === 'function') {
      callback(g);
    }
    return g;
  }
  return createRoot;
}

/** API for creating directional graph objects. */
export const digraph = builder(true);

/** API for creating omnidirectional graph objects. */
export const graph = builder(false);

/** Provides a strict mode API. */
export const strict = Object.freeze({
  /** API for creating directional graph objects in strict mode. */
  digraph: builder(true, true),
  /** API for creating omnidirectional graph objects in strict mode. */
  graph: builder(false, true),
});
