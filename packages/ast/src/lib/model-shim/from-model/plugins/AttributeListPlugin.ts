import type { AttributeListModel } from '@ts-graphviz/common';
import { createElement } from '../../../builder/create-element.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute } from './utils/index.js';

export const AttributeListPlugin: ConvertFromModelPlugin<AttributeListModel> = {
  match(model) {
    return model.$$type === 'AttributeList';
  },
  convert(context, model) {
    return createElement(
      'AttributeList',
      {
        kind: model.$$kind,
      },
      model.values.map(([key, value]) => convertAttribute(key, value)),
    );
  },
};
