import type { DotModel } from '@ts-graphviz/common';
import type { DotASTNode } from '../../../types.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertComment } from './utils/convert-comment.js';

export const DotPlugin: ConvertFromModelPlugin<DotModel> = {
  match(model) {
    return model.$$type === 'Dot';
  },
  convert(context, model) {
    const { createElement } = context;
    const children: DotASTNode['children'] = [];
    if (model.comment) {
      children.push(
        convertComment(createElement, model.comment, context.commentKind),
      );
    }
    for (const graph of model.graphs) {
      // A root graph's comment is written right before the graph statement.
      if (graph.comment) {
        children.push(
          convertComment(createElement, graph.comment, context.commentKind),
        );
      }
      children.push(context.convert(graph));
    }
    return createElement('Dot', {}, children);
  },
};
