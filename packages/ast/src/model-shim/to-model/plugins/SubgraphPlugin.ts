import type { SubgraphASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

export const SubgraphPlugin: ConvertToModelPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  convert(context, ast) {
    const subgraph = new context.models.Subgraph(
      Object.hasOwn(ast, 'id') ? ast.id?.value : undefined,
    );
    applyStatements(context, subgraph, ast.children);
    return subgraph;
  },
};
