import { AttributeListModel } from '#lib/common';
import { ConvertPlugin } from '../types.js';
import { convertAttribute } from './utils/index.js';
import { createElement } from '../../create-element.js';

export const AttributeListPrintPlugin: ConvertPlugin<AttributeListModel> = {
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
