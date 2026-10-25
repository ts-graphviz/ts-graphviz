import type { NodeRefASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const NodeRefPrintPlugin: PrintPlugin<NodeRefASTNode> = {
  match(ast) {
    return ast.type === 'NodeRef';
  },
  *print(context, ast) {
    yield* context.print(ast.id);
    // A node parsed without a port or compass point does not own the field.
    if (Object.hasOwn(ast, 'port') && ast.port) {
      yield ':';
      yield* context.print(ast.port);
    }
    if (Object.hasOwn(ast, 'compass') && ast.compass) {
      yield ':';
      yield* context.print(ast.compass);
    }
  },
};
