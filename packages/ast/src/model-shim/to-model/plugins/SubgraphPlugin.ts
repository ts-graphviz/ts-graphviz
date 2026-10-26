import { ownField } from '../../../own-field.js';
import type { SubgraphASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

export const SubgraphPlugin: ConvertToModelPlugin<SubgraphASTNode> = {
  match(ast) {
    return ast.type === 'Subgraph';
  },
  convert(context, ast) {
    const id = ownField(ast, 'id');
    const subgraph = new context.models.Subgraph(
      id ? idFromLiteral(id) : undefined,
    );
    applyStatements(context, subgraph, ast.children);
    return subgraph;
  },
};
