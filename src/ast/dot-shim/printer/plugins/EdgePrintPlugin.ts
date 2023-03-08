import { EdgeASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const EdgePrintPlugin: PrintPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  *print(context, ast) {
    const edgeOperator = context.directed ? ' -> ' : ' -- ';
    const targetIter = ast.targets[Symbol.iterator]();
    let next = targetIter.next();
    while (true) {
      yield* context.print(next.value);
      next = targetIter.next();
      if (!next.done) {
        yield edgeOperator;
      } else {
        break;
      }
    }

    if (ast.children.length === 0) {
      yield ';';
      return;
    }
    yield ' [';
    if (ast.children.length >= 1) {
      yield* context.printChildren(ast.children);
    }
    yield '];';
  },
};
