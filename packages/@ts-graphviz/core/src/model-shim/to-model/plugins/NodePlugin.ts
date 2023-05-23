import { NodeASTNode, AttributeASTNode } from '@ts-graphviz/ast';
import { ConvertToModelPlugin } from '../types.js';

export const NodePlugin: ConvertToModelPlugin<NodeASTNode> = {
  match(ast) {
    return ast.type === 'Node';
  },
  convert(context, ast) {
    const node = new context.models.Node(
      ast.id.value,
      ast.children
        .filter<AttributeASTNode>((v): v is AttributeASTNode => v.type === 'Attribute')
        .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
    );
    return node;
  },
};
