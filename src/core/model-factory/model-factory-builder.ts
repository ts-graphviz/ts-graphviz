import {
  GraphAttributesObject,
  ModelsContext,
  RootGraphModel,
  RootModelsContext,
} from '../../common.js';
import { ModelFactory } from './types.js';

/**
 * ModelFactoryBuilder is a function that takes two parameters, directed and strictMode, and returns a ModelFactory.
 *
 * @param directed A boolean value indicating whether the graph should be directed or not.
 * @param strictMode A boolean value indicating whether the graph should be in strict mode or not.
 * @returns A ModelFactory that takes an array of unknowns as parameters and returns a RootGraphModel.
 * @hidden
 */
export function ModelFactoryBuilder(
  this: ModelsContext,
  directed: boolean,
  strictMode: boolean,
): ModelFactory {
  return (...args: unknown[]) => {
    const G = directed ? this.Digraph : this.Graph;
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is GraphAttributesObject => typeof arg === 'object',
    );
    const callback = args.find(
      (arg): arg is (g: RootGraphModel) => void => typeof arg === 'function',
    );
    const g = new G(id, strictMode, attributes);
    g.with(this);
    if (typeof callback === 'function') {
      callback(g);
    }
    return g;
  };
}

/**
 * createModelFactories is a function that takes a boolean value, strict, and an optional ModelsContext parameter, context, and returns an object containing two ModelFactories.
 *
 * @param strict A boolean value indicating whether the graph should be in strict mode or not.
 * @param context An optional ModelsContext parameter.
 * @returns An object containing two ModelFactories, one for directed graphs and one for undirected graphs.
 */
export function createModelFactories(
  strict: boolean,
  context: ModelsContext = RootModelsContext,
) {
  return Object.freeze({
    digraph: ModelFactoryBuilder.call(context, true, strict),
    graph: ModelFactoryBuilder.call(context, false, strict),
  });
}
