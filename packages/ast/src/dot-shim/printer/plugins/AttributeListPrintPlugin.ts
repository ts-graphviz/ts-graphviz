import type { ASTNode, AttributeListASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const AttributeListPrintPlugin: PrintPlugin<AttributeListASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'AttributeList';
  },
  *print(context, ast) {
    if (ast.children.length === 0) {
      yield `${ast.kind.toLocaleLowerCase()} [];`;
    } else {
      yield `${ast.kind.toLocaleLowerCase()} [`;
      yield* context.printChildren(ast.children);
      yield '];';
    }
  },
};
