import { withCode } from '@ts-graphviz/common';
import { ownField } from '../../../own-field.js';
import type { ASTNode, AttributeListASTNode } from '../../../types.js';
import type { PrintPlugin } from '../types.js';

const KINDS: ReadonlySet<unknown> = new Set(['Graph', 'Node', 'Edge']);

export const AttributeListPrintPlugin: PrintPlugin<AttributeListASTNode> = {
  match(ast: ASTNode) {
    return ast.type === 'AttributeList';
  },
  *print(context, ast) {
    // Written as a keyword, so only the three kinds (an AST can come from
    // anywhere, such as parsed JSON).
    if (!KINDS.has(ast.kind)) {
      throw withCode(
        new TypeError(
          `An attribute list must be of kind Graph, Node or Edge: ${typeof ast.kind === 'string' ? JSON.stringify(ast.kind.slice(0, 64)) : `a value of type ${typeof ast.kind}`}`,
        ),
        'TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND',
      );
    }
    yield ast.kind.toLowerCase();
    if (ownField(ast, 'danglingComments')?.length) {
      yield ' ';
      yield* context.printComments(ownField(ast, 'danglingComments'), 'inline');
    } else {
      yield ' ';
    }
    if (ast.children.length === 0) {
      yield '[];';
    } else {
      yield '[';
      yield* context.printChildren(ast.children);
      yield '];';
    }
  },
};
