import { map, pipe } from '../../../../utils/index.js';
import { ASTNode, AttributeListASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';
import { endOfLine, joinBy, indent, wrapByPair } from './utils/index.js';

export const AttributeListPrintPlugin: PrintPlugin<AttributeListASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'AttributeList';
  },
  print(context, ast): string {
    if (ast.children.length === 0) {
      return `${ast.kind.toLocaleLowerCase()} [];`;
    }
    const eol = endOfLine(context.endOfLine);
    return pipe(
      map(context.print),
      joinBy(eol),
      indent(context.indentStyle, context.indentSize, eol),
      wrapByPair(`${ast.kind.toLocaleLowerCase()} [${eol}`, `${eol}];`),
    )(ast.children);
  },
};
