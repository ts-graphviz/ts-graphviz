import { ownField } from '../../../own-field.js';
import type { NodeRefASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const NodeRefPrintPlugin: PrintPlugin<NodeRefASTNode> = {
  match(ast) {
    return ast.type === 'NodeRef';
  },
  *print(context, ast) {
    yield* context.print(ast.id);
    const port = ownField(ast, 'port');
    if (port) {
      yield ':';
      yield* context.print(port);
    }
    const compass = ownField(ast, 'compass');
    if (compass) {
      yield ':';
      yield* context.print(compass);
    }
  },
};
