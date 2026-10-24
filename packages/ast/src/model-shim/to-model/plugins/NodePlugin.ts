import type { AttributeASTNode, NodeASTNode } from '../../../types.js';
import { idFromLiteral } from '../../literal.js';
import type { ConvertToModelPlugin } from '../types.js';
import { collectAttributes } from './utils/collect-attributes.js';

export const NodePlugin: ConvertToModelPlugin<NodeASTNode> = {
  match(ast) {
    return ast.type === 'Node';
  },
  convert(context, ast) {
    const node = new context.models.Node(idFromLiteral(ast.id));
    node.attributes.apply(
      collectAttributes(
        ast.children.filter<AttributeASTNode>(
          (v): v is AttributeASTNode => v.type === 'Attribute',
        ),
      ),
    );
    return node;
  },
};
