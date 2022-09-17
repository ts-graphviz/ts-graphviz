import { RootGraphModel } from '#/lib/common';
import { ConvertPlugin } from '../types.js';
import { createElement } from '../../create-element.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';
import { convertComment } from './utils/convert-comment.js';

export const GraphConvertPlugin: ConvertPlugin<RootGraphModel> = {
  match(model) {
    return model.$$type === 'Graph';
  },
  convert(context, model) {
    return createElement('Dot', {}, [
      ...(model.comment ? [convertComment(model.comment, context.commentKind)] : []),
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
