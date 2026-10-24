import type { NodeModel } from '@ts-graphviz/common';
import { idToRaw } from '../../literal.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute } from './utils/index.js';

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
            value: idToRaw(model.id),
            quoted: true,
          },
          [],
        ),
      },
      model.attributes.values.map(([key, value]) =>
        convertAttribute(createElement, key, value),
      ),
    );
  },
};
