import { RootGraphModel, getASTType, isDirected } from '@ts-graphviz/common';
import { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';
import { convertComment } from './utils/convert-comment.js';
import { createElement } from '@ts-graphviz/ast';

export const GraphPlugin: ConvertFromModelPlugin<RootGraphModel> = {
  match(model) {
    return getASTType(model) === 'Graph';
  },
  convert(context, model) {
    return createElement('Dot', {}, [
      ...(model.comment ? [convertComment(model.comment, context.commentKind)] : []),
      createElement(
        'Graph',
        {
          directed: isDirected(model),
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
