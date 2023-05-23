import { AttributeListModel, getASTType } from '@ts-graphviz/common';
import { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute } from './utils/index.js';
import { getAttributeListKind } from '@ts-graphviz/common';
import { createElement } from '@ts-graphviz/ast';

export const AttributeListPlugin: ConvertFromModelPlugin<AttributeListModel> = {
  match(model) {
    return getASTType(model) === 'AttributeList';
  },
  convert(context, model) {
    return createElement(
      'AttributeList',
      {
        kind: getAttributeListKind(model),
      },
      model.values.map(([key, value]) => convertAttribute(key, value)),
    );
  },
};
