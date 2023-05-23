import { GraphASTNode } from '@ts-graphviz/ast';
import { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statments.js';

export const GraphPlugin: ConvertToModelPlugin<GraphASTNode> = {
  match(ast) {
    return ast.type === 'Graph';
  },
  convert(context, ast) {
    const G = ast.directed ? context.models.Digraph : context.models.Graph;
    const graph = new G(ast.id?.value, ast.strict);
    applyStatements(graph, ast.children);
    return graph;
  },
};
