import { RootGraphModel } from '../../../../common.js';
import { createElement } from '../../../builder/create-element.js';
import { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';
import { convertComment } from './utils/convert-comment.js';

export const GraphPlugin: ConvertFromModelPlugin<RootGraphModel> = {
  match(model) {
    return model.$$type === 'Graph';
  },
  convert(context, model) {
    return createElement('Dot', {}, [
      ...(model.comment
        ? [convertComment(model.comment, context.commentKind)]
        : []),
      createElement(
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
      ),
    ]);
  },
};
