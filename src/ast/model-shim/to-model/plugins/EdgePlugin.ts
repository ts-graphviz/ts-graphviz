import { AttributeASTNode, EdgeASTNode } from '../../../types.js';
import { ConvertToModelPlugin } from '../types.js';
import { convertToEdgeTargetTuple } from './utils/convert-to-edge-target-tuple.js';

export const EdgePlugin: ConvertToModelPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  convert(context, ast) {
    const edge = new context.models.Edge(
      convertToEdgeTargetTuple(ast),
      ast.children
        .filter<AttributeASTNode>(
          (v): v is AttributeASTNode => v.type === 'Attribute',
        )
        .reduce(
          (acc, curr) => {
            acc[curr.key.value] = curr.value.value;
            return acc;
          },
          {} as { [key: string]: string },
        ),
    );
    return edge;
  },
};
