import type { NodeModel } from '@ts-graphviz/common';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute, convertComment } from './utils/index.js';

export const NodePlugin: ConvertFromModelPlugin<NodeModel> = {
  match(model) {
    return model.$$type === 'Node';
  },
  convert(context, model) {
    const { createElement } = context;
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
        ...(model.attributes.comment
          ? [
              convertComment(
                createElement,
                model.attributes.comment,
                context.commentKind,
              ),
            ]
          : []),
        ...model.attributes.values.map(([key, value]) =>
          convertAttribute(createElement, key, value),
        ),
      ],
    );
  },
};
