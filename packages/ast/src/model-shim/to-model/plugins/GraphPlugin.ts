import { ownField } from '../../../own-field.js';
import type { GraphASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

export const GraphPlugin: ConvertToModelPlugin<GraphASTNode> = {
  match(ast) {
    return ast.type === 'Graph';
  },
  convert(context, ast) {
    const id = ownField(ast, 'id');
    const name = id ? idFromLiteral(id) : undefined;
    const graph = ast.directed
      ? context.models.createDigraph(name, ast.strict)
      : context.models.createGraph(name, ast.strict);
    applyStatements(context, graph, ast.children);
    return graph;
  },
};
