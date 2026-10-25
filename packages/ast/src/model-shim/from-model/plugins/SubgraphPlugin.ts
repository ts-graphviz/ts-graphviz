import type { SubgraphModel } from '@ts-graphviz/common';
import { idToRaw } from '../../literal.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const SubgraphPlugin: ConvertFromModelPlugin<SubgraphModel> = {
  match(model) {
    return model.$$type === 'Subgraph';
  },
  convert(context, model) {
    const { createElement } = context;
    return createElement(
      'Subgraph',
      {
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
