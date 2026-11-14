import type { AttributeASTNode, NodeASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { collectAttributes } from './utils/collect-attributes.js';

export const NodePlugin: ConvertToModelPlugin<NodeASTNode> = {
  match(ast) {
    return ast.type === 'Node';
  },
  convert(context, ast) {
    const node = context.models.createNode(idFromLiteral(ast.id));
    node.setAttributes(
      collectAttributes(
        ast.children.filter<AttributeASTNode>(
          (v): v is AttributeASTNode => v.type === 'Attribute',
        ),
      ),
    );
    return node;
  },
};
