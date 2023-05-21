import { SubgraphModel, getASTType } from '@ts-graphviz/common';
import { ConvertFromModelPlugin } from '../types.js';
import { createElement } from '../../../builder/create-element.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const SubgraphPlugin: ConvertFromModelPlugin<SubgraphModel> = {
  match(model) {
    return getASTType(model) === 'Subgraph';
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
