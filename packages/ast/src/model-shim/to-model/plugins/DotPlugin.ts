import type { CommentASTNode, DotASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
import { isCommentAttachedTo } from './utils/comment-holder.js';

export const DotPlugin: ConvertToModelPlugin<DotASTNode> = {
  match(ast) {
    return ast.type === 'Dot';
  },
  convert(context, ast) {
    const dot = new context.models.Dot();
    // Comments that do not sit right before a graph belong to the Dot model.
    const dangling: string[] = [];
    let pending: CommentASTNode | null = null;
    for (const stmt of ast.children) {
      switch (stmt.type) {
        case 'Comment':
          if (pending) dangling.push(pending.value);
          pending = stmt;
          break;
        case 'Graph': {
          const graph = context.convert(stmt);
          if (pending) {
            if (isCommentAttachedTo(pending, stmt.location)) {
              graph.comment = pending.value;
            } else {
              dangling.push(pending.value);
            }
            pending = null;
          }
          dot.addGraph(graph);
          break;
        }
      }
    }
    if (pending) dangling.push(pending.value);
    if (dangling.length > 0) {
      dot.comment = dangling.join('\n');
    }
    return dot;
  },
};
