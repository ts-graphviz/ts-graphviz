import { DotASTNode } from '../../../types.js';
import { EOL, PrintPlugin } from '../types.js';

export const DotPrintPlugin: PrintPlugin<DotASTNode> = {
  match(ast) {
    return ast.type === 'Dot';
  },
  *print(context, ast) {
    const tokenIter = ast.children[Symbol.iterator]();
    let next = tokenIter.next();
    while (true) {
      yield* context.print(next.value);
      next = tokenIter.next();
      if (next.done) {
        break;
      }
      yield EOL;
    }
  },
};
