import type { AttributeASTNode, EdgeASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
import { collectAttributes } from './utils/collect-attributes.js';
import { convertToEdgeTargetTuple } from './utils/convert-to-edge-target-tuple.js';

export const EdgePlugin: ConvertToModelPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  convert(context, ast) {
    const edge = new context.models.Edge(
      convertToEdgeTargetTuple(ast),
      collectAttributes(
        ast.children.filter<AttributeASTNode>(
          (v): v is AttributeASTNode => v.type === 'Attribute',
        ),
      ),
    );
    return edge;
  },
};
