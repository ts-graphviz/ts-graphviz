import type { SubgraphModel } from '@ts-graphviz/common';
import { createElement } from '../../../builder/create-element.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const SubgraphPlugin: ConvertFromModelPlugin<SubgraphModel> = {
  match(model) {
    return model.$$type === 'Subgraph';
  },
  convert(context, model) {
    return createElement(
      'Subgraph',
      {
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
