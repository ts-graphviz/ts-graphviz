import { SubgraphModel, getASTType } from '@ts-graphviz/common';
import { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';
import { createElement } from '@ts-graphviz/ast';

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
