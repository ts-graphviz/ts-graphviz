import { SubgraphModel } from '../../../common/index.js';
import { ConvertPlugin } from '../types.js';
import { createElement } from '../../create-element.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const SubgraphConvertPlugin: ConvertPlugin<SubgraphModel> = {
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
