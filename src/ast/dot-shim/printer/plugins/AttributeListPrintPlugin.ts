import { ASTNode, AttributeListASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const AttributeListPrintPlugin: PrintPlugin<AttributeListASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'AttributeList';
  },
  *print(context, ast) {
    yield ast.kind.toLocaleLowerCase();
    yield ' [';
    if (ast.children.length >= 1) {
      yield* context.printChildren(ast.children);
    }
    yield '];';
  },
};
