import type { AttributeASTNode, EdgeASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
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
            if (curr.value.quoted === 'html') {
              acc[curr.key.value] = `<${curr.value.value}>`;
            } else {
              acc[curr.key.value] = curr.value.value;
            }
            return acc;
          },
          {} as { [key: string]: string },
        ),
    );
    return edge;
  },
};
