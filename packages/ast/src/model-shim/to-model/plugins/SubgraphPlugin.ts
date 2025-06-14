import type { SubgraphASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statments.js';

export const SubgraphPlugin: ConvertToModelPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  convert(context, ast) {
    const subgraph = new context.models.Subgraph(ast.id?.value);
    applyStatements(context, subgraph, ast.children);
    return subgraph;
  },
};
