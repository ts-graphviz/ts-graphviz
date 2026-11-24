import {
  type ModelKit,
  type ModelTypes,
  type RootGraphModel,
  readArguments,
} from '@ts-graphviz/common';
import { defaultModelKit } from '@ts-graphviz/core';
import { isFunction, isString } from './arguments.js';
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
  const name = directed ? 'digraph()' : 'graph()';
  return (...args: unknown[]) => {
    // By position: an id, then the callback, either of which may be left
    // out.
    const [id, callback] = readArguments(name, args, [
      isString,
      isFunction,
    ]) as [string | undefined, ((g: DSL<RootGraphModel>) => void) | undefined];
    const options = { strict: strictMode };
    const g = directed
      ? this.createDigraph(id, options)
      : this.createGraph(id, options);
    const view = dsl(g, this);
    if (typeof callback === 'function') {
      callback(view);
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
