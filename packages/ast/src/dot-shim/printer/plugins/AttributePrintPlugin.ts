import type { ASTNode, AttributeASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const AttributePrintPlugin: PrintPlugin<AttributeASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'Attribute';
  },
  *print(context, ast) {
    yield* context.print(ast.key);
    yield ' = ';
    yield* context.print(ast.value);
    yield ';';
  },
};
