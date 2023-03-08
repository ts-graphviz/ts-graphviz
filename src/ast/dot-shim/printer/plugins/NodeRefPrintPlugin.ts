import { NodeRefASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const NodeRefPrintPlugin: PrintPlugin<NodeRefASTNode> = {
  match(ast) {
    return ast.type === 'NodeRef';
  },
  *print(context, ast) {
    yield* context.print(ast.id);
    if (ast.port) {
      yield ':';
      yield* context.print(ast.port);
    }
    if (ast.compass) {
      yield ':';
      yield* context.print(ast.compass);
    }
  },
};
