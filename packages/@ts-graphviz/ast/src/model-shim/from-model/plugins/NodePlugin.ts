import { NodeModel, getASTType } from '@ts-graphviz/common';
import { ConvertFromModelPlugin } from '../types.js';
import { createElement } from '../../../builder/create-element.js';
import { convertComment, convertAttribute } from './utils/index.js';

export const NodePlugin: ConvertFromModelPlugin<NodeModel> = {
  match(model) {
    return getASTType(model) === 'Node';
  },
  convert(context, model) {
    return createElement(
      'Node',
      {
        id: createElement(
          'Literal',
          {
            value: model.id,
            quoted: true,
          },
          [],
        ),
      },
      [
        ...(model.attributes.comment ? [convertComment(model.attributes.comment, context.commentKind)] : []),
        ...model.attributes.values.map(([key, value]) => convertAttribute(key, value)),
      ],
    );
  },
};
