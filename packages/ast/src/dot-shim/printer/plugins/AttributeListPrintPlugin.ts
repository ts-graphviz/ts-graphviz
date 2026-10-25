import type { ASTNode, AttributeListASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const AttributeListPrintPlugin: PrintPlugin<AttributeListASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'AttributeList';
  },
  *print(context, ast) {
    yield ast.kind.toLocaleLowerCase();
    if (ast.danglingComments?.length) {
      yield ' ';
      yield* context.printComments(ast.danglingComments, 'inline');
    } else {
      yield ' ';
    }
    if (ast.children.length === 0) {
      yield '[];';
    } else {
      yield '[';
      yield* context.printChildren(ast.children);
      yield '];';
    }
  },
};
