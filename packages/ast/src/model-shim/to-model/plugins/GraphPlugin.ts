import { ownField } from '../../../own-field.js';
import type { GraphASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

/**
 * The plugin for graphs; with `legacy`, a node or a subgraph declared again
 * adds to the first one with its id, as 3.x did.
 */
export function graphPlugin(
  legacy: boolean,
): ConvertToModelPlugin<GraphASTNode> {
  return {
    match(ast) {
      return ast.type === 'Graph';
    },
    convert(context, ast) {
      const id = ownField(ast, 'id');
      const name = id ? idFromLiteral(id) : undefined;
      const options = { strict: ast.strict };
      const graph = ast.directed
        ? context.models.createDigraph(name, undefined, options)
        : context.models.createGraph(name, undefined, options);
      applyStatements(context, graph, ast.children, legacy);
      return graph;
    },
  };
}

export const GraphPlugin: ConvertToModelPlugin<GraphASTNode> =
  graphPlugin(false);
