import type { AttributeASTNode, NodeASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';

export const NodePlugin: ConvertToModelPlugin<NodeASTNode> = {
  match(ast) {
    return ast.type === 'Node';
  },
  convert(context, ast) {
    const node = new context.models.Node(
      ast.id.value,
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
    return node;
  },
};
