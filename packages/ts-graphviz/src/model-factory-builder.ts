import type {
  GraphAttributesObject,
  ModelKit,
  ModelTypes,
  RootGraphModel,
} from '@ts-graphviz/common';
import { defaultModelKit } from '@ts-graphviz/core';
import { type DSL, dsl } from './dsl.js';
import type { ModelFactories, ModelFactory } from './types.js';

/**
 * ModelFactoryBuilder is a function that takes two parameters, directed and strictMode, and returns a ModelFactory.
 *
 * @param directed A boolean value indicating whether the graph should be directed or not.
 * @param strictMode A boolean value indicating whether the graph should be in strict mode or not.
 * @returns A ModelFactory that takes an array of unknowns as parameters and returns a RootGraphModel.
 * @hidden
 */
export function ModelFactoryBuilder(
  this: ModelKit,
  directed: boolean,
  strictMode: boolean,
): ModelFactory {
  return (...args: unknown[]) => {
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is GraphAttributesObject => typeof arg === 'object',
    );
    const callback = args.find(
      (arg): arg is (g: DSL<RootGraphModel>, kit: ModelKit) => void =>
        typeof arg === 'function',
    );
    const g = directed
      ? this.createDigraph(id, strictMode, attributes)
      : this.createGraph(id, strictMode, attributes);
    const view = dsl(g, this);
    if (typeof callback === 'function') {
      callback(view, this);
    }
    return view;
  };
}

/**
 * createModelFactories is a function that takes a boolean value, strict, and an optional ModelKit parameter, kit, and returns an object containing two ModelFactories.
 *
 * @param strict A boolean value indicating whether the graph should be in strict mode or not.
 * @param kit The kit that creates the graphs; by default `defaultModelKit`.
 * @returns An object containing two ModelFactories, one for directed graphs and one for undirected graphs.
 */
export function createModelFactories<M extends ModelTypes = ModelTypes>(
  strict: boolean,
  kit: ModelKit<M> = defaultModelKit as ModelKit<M>,
): Readonly<ModelFactories<M>> {
  // The graphs come from the kit's classes, which `M` describes.
  return Object.freeze({
    digraph: ModelFactoryBuilder.call(kit, true, strict) as ModelFactory<
      M['Digraph'],
      M
    >,
    graph: ModelFactoryBuilder.call(kit, false, strict) as ModelFactory<
      M['Graph'],
      M
    >,
  });
}
