import { map, pipe } from '../../utils/functional.js';
import { GraphASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';
import { endOfLine, joinBy, indent, wrapByPair } from './utils/index.js';

export const GraphPrintPlugin: PrintPlugin<GraphASTNode> = {
  match(ast) {
    return ast.type === 'Graph';
  },
  print(context, ast): string {
    context.directed = ast.directed;
    const parts: string[] = [];
    if (ast.strict) {
      parts.push('strict');
    }
    parts.push(ast.directed ? 'digraph' : 'graph');
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
