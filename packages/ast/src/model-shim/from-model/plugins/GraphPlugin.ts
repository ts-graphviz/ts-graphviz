import type { RootGraphModel } from '@ts-graphviz/common';
import { idToRaw } from '../../literal.js';
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
        // `""` is a valid (empty) id, so test for presence, not truthiness
        id:
          model.id !== undefined
            ? createElement(
                'Literal',
                {
                  value: idToRaw(model.id),
                  kind: 'quoted',
                },
                [],
              )
            : undefined,
      },
      convertClusterChildren(context, model),
    );
  },
};
