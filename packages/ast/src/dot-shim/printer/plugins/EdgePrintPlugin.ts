import type {
  EdgeASTNode,
  EdgeTargetASTNode,
  NodeASTNode,
} from '../../../types.js';
import type { PrintContext, PrintPlugin } from '../types.js';

/**
 * The nodes of an anonymous subgraph that holds nothing but plain node
 * statements, which is written in the short form `{a b}`.
 */
function plainNodes(target: EdgeTargetASTNode): NodeASTNode[] | undefined {
  if (target.type !== 'Subgraph' || target.id !== undefined) return undefined;
  const nodes = target.children;
  return nodes.length > 0 &&
    nodes.every((n) => n.type === 'Node' && n.children.length === 0)
    ? (nodes as NodeASTNode[])
    : undefined;
}

function* printTarget(
  context: PrintContext,
  target: EdgeTargetASTNode,
): Iterable<string> {
  const nodes = plainNodes(target);
  if (nodes === undefined) {
    yield* context.print(target);
    return;
  }
  yield '{';
  yield* context.join(
    nodes.map((n) => n.id),
    ' ',
  );
  yield '}';
}

export const EdgePrintPlugin: PrintPlugin<EdgeASTNode> = {
  match(ast) {
    return ast.type === 'Edge';
  },
  *print(context, ast) {
    const op = context.directed ? ' -> ' : ' -- ';
    for (const [i, target] of ast.targets.entries()) {
      if (i > 0) yield op;
      yield* printTarget(context, target);
    }
    if (ast.children.length === 0) {
      yield ';';
    } else {
      yield ' [';
      yield* context.printChildren(ast.children);
      yield '];';
    }
  },
};
