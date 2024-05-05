import type { DotASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';
import { endOfLine } from './utils/index.js';

export const DotPrintPlugin: PrintPlugin<DotASTNode> = {
  match(ast) {
    return ast.type === 'Dot';
  },
  print(context, ast): string {
    return ast.children.map(context.print).join(endOfLine(context.endOfLine));
  },
};
