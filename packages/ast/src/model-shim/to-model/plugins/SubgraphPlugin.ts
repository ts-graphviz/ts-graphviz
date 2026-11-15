import { ownField } from '../../../own-field.js';
import type { SubgraphASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { applyStatements } from './utils/apply-statements.js';

/**
 * The plugin for subgraphs; with `legacy`, a node or a subgraph declared
 * again adds to the first one with its id, as 3.x did.
 */
export function subgraphPlugin(
  legacy: boolean,
): ConvertToModelPlugin<SubgraphASTNode> {
  return {
    match(ast) {
      return ast.type === 'Subgraph';
    },
    convert(context, ast) {
      const id = ownField(ast, 'id');
      const subgraph = context.models.createSubgraph(
        id ? idFromLiteral(id) : undefined,
      );
      applyStatements(context, subgraph, ast.children, legacy);
      return subgraph;
    },
  };
}

export const SubgraphPlugin: ConvertToModelPlugin<SubgraphASTNode> =
  subgraphPlugin(false);
