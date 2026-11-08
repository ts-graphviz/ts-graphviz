import type { ReadonlyDotModel } from '@ts-graphviz/common';
import type { DotASTNode } from '../../../types.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertComments } from './utils/convert-comment.js';

export const DotPlugin: ConvertFromModelPlugin<ReadonlyDotModel> = {
  match(model) {
    return model.$$type === 'Dot';
  },
  convert(context, model) {
    const { createElement, commentKind } = context;
    const children: DotASTNode['children'] = [
      ...convertComments(createElement, model, 'leading', commentKind),
    ];
    for (const graph of model.graphs) {
      // A root graph's leading comments are written right before it, and
      // its trailing ones after it on its line.
      children.push(
        ...convertComments(createElement, graph, 'leading', commentKind),
        context.convert(graph),
      );
    }
    children.push(...convertComments(createElement, model, 'end', commentKind));
    return createElement('Dot', {}, children);
  },
};
