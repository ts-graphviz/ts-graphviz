import { SubgraphASTNode } from '../../types.js';
import { PrintPlugin } from '../types.js';
import { endOfLine, joinBy, indent, map, pipe, wrapByPair } from './utils/index.js';

export const SubgraphPrintPlugin: PrintPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  print(context, ast): string {
    const parts: string[] = ['subgraph'];
    if (ast.id) {
      parts.push(context.print(ast.id));
    }
    if (ast.children.length === 0) {
      return `${parts.join(' ')} {}`;
    }
    const eol = endOfLine(context.endOfLine);
    const contents = pipe(
      map(context.print),
      joinBy(eol),
      indent(context.indentStyle, context.indentSize, eol),
      wrapByPair(`{${eol}`, `${eol}}`),
    )(ast.children);
    return `${parts.join(' ')} ${contents}`;
  },
};
