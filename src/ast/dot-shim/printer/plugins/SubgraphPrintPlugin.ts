import { SubgraphASTNode } from '../../../types.js';
import { PrintPlugin } from '../types.js';

export const SubgraphPrintPlugin: PrintPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  *print(context, ast) {
    yield 'subgraph';
    if (ast.id) {
      yield ' ';
      yield* context.print(ast.id);
    }
    yield ' {';
    if (ast.children.length >= 1) {
      yield* context.printChildren(ast.children);
    }
    yield '}';
  },
};
