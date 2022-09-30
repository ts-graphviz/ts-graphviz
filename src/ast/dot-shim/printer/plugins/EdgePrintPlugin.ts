import { map, pipe } from '../../../../utils/index.js';
import { EdgeASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';
import { endOfLine, joinBy, indent, wrapByPair } from './utils/index.js';

export const EdgePrintPlugin: PrintPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  print(context, ast): string {
    const targets = pipe(map(context.print), joinBy(context.directed ? ' -> ' : ' -- '))(ast.targets);
    if (ast.children.length === 0) {
      return `${targets};`;
    }
    const eol = endOfLine(context.endOfLine);
    const contents = pipe(
      map(context.print),
      joinBy(eol),
      indent(context.indentStyle, context.indentSize, eol),
      wrapByPair(`[${eol}`, `${eol}];`),
    )(ast.children);
    return `${targets} ${contents}`;
  },
};
