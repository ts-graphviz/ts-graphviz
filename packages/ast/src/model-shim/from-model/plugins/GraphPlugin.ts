import type { RootGraphModel } from '@ts-graphviz/common';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const GraphPlugin: ConvertFromModelPlugin<RootGraphModel> = {
  match(model) {
    return model.$$type === 'Graph';
  },
  // The graph's own `comment` is emitted by DotPlugin, before the graph statement.
  convert(context, model) {
    const { createElement } = context;
    return createElement(
      'Graph',
      {
        directed: model.directed,
        strict: model.strict,
        id: model.id
          ? createElement(
              'Literal',
              {
                value: model.id,
                quoted: true,
              },
              [],
            )
          : undefined,
      },
      convertClusterChildren(context, model),
    );
  },
};
