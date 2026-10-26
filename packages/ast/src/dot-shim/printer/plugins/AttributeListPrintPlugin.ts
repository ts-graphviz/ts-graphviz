import type { ASTNode, AttributeListASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

const KEYWORDS = { Graph: 'graph', Node: 'node', Edge: 'edge' } as const;

export const AttributeListPrintPlugin: PrintPlugin<AttributeListASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'AttributeList';
  },
  *print(context, ast) {
    const keyword = KEYWORDS[ast.kind as keyof typeof KEYWORDS];
    if (!Object.hasOwn(KEYWORDS, ast.kind) || keyword === undefined) {
      throw new TypeError(
        `An attribute list's kind must be 'Graph', 'Node' or 'Edge', not ${JSON.stringify(String(ast.kind))}.`,
      );
    }
    if (ast.children.length === 0) {
      yield `${keyword} [];`;
    } else {
      yield `${keyword} [`;
      yield* context.printChildren(ast.children);
      yield '];';
    }
  },
};
