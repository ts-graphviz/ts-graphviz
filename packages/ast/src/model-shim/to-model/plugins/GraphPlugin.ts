import type { GraphASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

export const GraphPlugin: ConvertToModelPlugin<GraphASTNode> = {
  match(ast) {
    return ast.type === 'Graph';
  },
  convert(context, ast) {
    const G = ast.directed ? context.models.Digraph : context.models.Graph;
    const graph = new G(ast.id ? idFromLiteral(ast.id) : undefined, ast.strict);
    applyStatements(context, graph, ast.children);
    return graph;
  },
};
