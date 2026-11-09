import type { ReadonlyRootGraphModel } from '@ts-graphviz/common';
import { idToRaw } from '../../literal.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const GraphPlugin: ConvertFromModelPlugin<ReadonlyRootGraphModel> = {
  match(model) {
    return model.$$type === 'Graph';
  },
  // The graph's leading and trailing comments are written by DotPlugin,
  // around the graph statement; its 'end' ones by convertClusterChildren.
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
