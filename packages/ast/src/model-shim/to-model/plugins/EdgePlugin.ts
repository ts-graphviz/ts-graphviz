import type { EdgeModel } from '@ts-graphviz/common';
import type { AttributeASTNode, EdgeASTNode } from '../../../types.js';
import type { ConvertToModelContext, ConvertToModelPlugin } from '../types.js';
import { collectAttributes } from './utils/collect-attributes.js';
import { convertToEdgeTargetTuple } from './utils/convert-to-edge-target-tuple.js';

/**
 * An edge model for an `Edge` AST node; `subgraphNodes` resolves subgraph
 * targets that have been added to a graph (see
 * {@link convertToEdgeTargetTuple}).
 */
export function convertEdge(
  context: ConvertToModelContext,
  ast: EdgeASTNode,
  subgraphNodes?: (index: number) => string[] | undefined,
): EdgeModel {
  const edge = new context.models.Edge(
    convertToEdgeTargetTuple(ast, subgraphNodes),
  );
  edge.attributes.apply(
    collectAttributes(
      ast.children.filter<AttributeASTNode>(
        (v): v is AttributeASTNode => v.type === 'Attribute',
      ),
    ),
  );
  return edge;
}

export const EdgePlugin: ConvertToModelPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  convert(context, ast) {
    return convertEdge(context, ast);
  },
};
