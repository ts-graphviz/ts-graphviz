import type { DotASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const DotPrintPlugin: PrintPlugin<DotASTNode> = {
  match(ast) {
    return ast.type === 'Dot';
  },
  *print(context, ast) {
    yield* context.join(ast.children, context.EOL);
  },
};
