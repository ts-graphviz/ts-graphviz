import type { SubgraphASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

export const SubgraphPlugin: ConvertToModelPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  convert(context, ast) {
    const subgraph = new context.models.Subgraph(
      ast.id ? idFromLiteral(ast.id) : undefined,
    );
    applyStatements(context, subgraph, ast.children);
    return subgraph;
  },
};
