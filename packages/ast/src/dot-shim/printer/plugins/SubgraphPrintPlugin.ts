import { ownField } from '../../../own-field.js';
import type { SubgraphASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

export const SubgraphPrintPlugin: PrintPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  *print(context, ast) {
    yield 'subgraph';
    if (ownField(ast, 'danglingComments')?.length) {
      yield ' ';
      yield* context.printComments(ownField(ast, 'danglingComments'), 'inline');
    }
    const id = ownField(ast, 'id');
    if (id) {
      yield ' ';
      yield* context.print(id);
    }
    yield ' {';
    if (ast.children.length >= 1) {
      yield* context.printChildren(ast.children);
    }
    yield '}';
  },
};
