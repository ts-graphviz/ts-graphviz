import { NodeRefASTNode } from '../../types.js';
import { PrintPlugin } from '../types.js';

export const NodeRefPrintPlugin: PrintPlugin<NodeRefASTNode> = {
  match(ast) {
    return ast.type === 'NodeRef';
  },
  print(context, ast): string {
    const parts = [context.print(ast.id)];
    if (ast.port) {
      parts.push(context.print(ast.port));
    }
    if (ast.compass) {
      parts.push(context.print(ast.compass));
    }
    return parts.join(':');
  },
};
