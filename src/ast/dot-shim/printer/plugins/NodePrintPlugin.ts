import { pipe, map } from '#lib/utils';
import { NodeASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';
import { endOfLine, joinBy, indent, wrapByPair } from './utils/index.js';

export const NodePrintPlugin: PrintPlugin<NodeASTNode> = {
  match(ast) {
    return ast.type === 'Node';
  },
  print(context, ast): string {
    const id = context.print(ast.id);
    if (ast.children.length === 0) {
      return `${id};`;
    }
    const eol = endOfLine(context.endOfLine);
    const contents = pipe(
      map(context.print),
      joinBy(eol),
      indent(context.indentStyle, context.indentSize, eol),
      wrapByPair(`[${eol}`, `${eol}];`),
    )(ast.children);
    return `${id} ${contents}`;
  },
};
