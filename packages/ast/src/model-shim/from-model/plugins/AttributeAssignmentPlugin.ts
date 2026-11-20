import type { ReadonlyAttributeAssignmentModel } from '@ts-graphviz/common';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute } from './utils/index.js';

export const AttributeAssignmentPlugin: ConvertFromModelPlugin<ReadonlyAttributeAssignmentModel> =
  {
    match(model) {
      return model.$$type === 'AttributeAssignment';
    },
    convert(context, model) {
      return convertAttribute(context.createElement, model.key, model.value);
    },
  };
