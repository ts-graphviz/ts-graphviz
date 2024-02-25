import { SubgraphASTNode } from '../../../types.js';
import { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statments.js';

export const SubgraphPlugin: ConvertToModelPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  convert(context, ast) {
    const subgraph = new context.models.Subgraph(ast.id?.value);
    applyStatements(subgraph, ast.children);
    return subgraph;
  },
};
