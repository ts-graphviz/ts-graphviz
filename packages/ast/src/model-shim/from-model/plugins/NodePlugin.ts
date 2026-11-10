import type { ReadonlyNodeModel } from '@ts-graphviz/common';
import { idToRaw } from '../../literal.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttributes } from './utils/index.js';

export const NodePlugin: ConvertFromModelPlugin<ReadonlyNodeModel> = {
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
            kind: 'quoted',
          },
          [],
        ),
      },
      convertAttributes(createElement, model),
    );
  },
};
