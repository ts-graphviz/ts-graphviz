import { NodeModel } from '#/lib/common';
import { ConvertPlugin } from '../types.js';
import { createElement } from '../../create-element.js';
import { convertComment, convertAttribute } from './utils/index.js';

export const NodeConvertPlugin: ConvertPlugin<NodeModel> = {
  match(model) {
    return model.$$type === 'Node';
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
