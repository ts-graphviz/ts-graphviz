import { GraphAttributesObject, ModelsContext, RootGraphModel, RootModelsContext } from '../../common/index.js';
import { ModelFactory } from './types.js';

/** @hidden */
export function ModelFactoryBuilder(this: ModelsContext, directed: boolean, strictMode: boolean): ModelFactory {
  return (...args: unknown[]) => {
    const G = directed ? this.Digraph : this.Graph;
    const id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is GraphAttributesObject => typeof arg === 'object');
    const callback = args.find((arg): arg is (g: RootGraphModel) => void => typeof arg === 'function');
    const g = new G(id, strictMode, attributes);
    g.with(this);
    if (typeof callback === 'function') {
      callback(g);
    }
    return g;
  };
}

export function createModelFactories(strict: boolean, context: ModelsContext = RootModelsContext) {
  return Object.freeze({
    digraph: ModelFactoryBuilder.call(context, true, strict),
    graph: ModelFactoryBuilder.call(context, false, strict),
  });
}
