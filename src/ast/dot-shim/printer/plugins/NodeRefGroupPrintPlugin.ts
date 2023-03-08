import { NodeRefGroupASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const NodeRefGroupPrintPlugin: PrintPlugin<NodeRefGroupASTNode> = {
  match(ast) {
    return ast.type === 'NodeRefGroup';
  },
  *print(context, ast) {
    yield '{';
    const iter = ast.children[Symbol.iterator]();
    let next = iter.next();
    while (true) {
      yield* context.print(next.value);
      next = iter.next();
      if (!next.done) {
        yield ' ';
      } else {
        break;
      }
    }
    yield '}';
  },
};
