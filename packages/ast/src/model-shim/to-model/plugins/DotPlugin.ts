import type { DotASTNode } from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
import { BodyComments } from './utils/body-comments.js';

export const DotPlugin: ConvertToModelPlugin<DotASTNode> = {
  match(ast) {
    return ast.type === 'Dot';
  },
  convert(context, ast) {
    const dot = new context.models.Dot();
    // A comment before a graph leads it, one on the line a graph ends
    // trails it, and the comments after the last graph are the source's.
    const comments = new BodyComments();
    for (const stmt of ast.children) {
      switch (stmt.type) {
        case 'Comment':
          comments.comment(stmt);
          break;
        case 'Graph': {
          const graph = context.convert(stmt);
          comments.statement(graph, stmt);
          dot.addGraph(graph);
          break;
        }
      }
    }
    comments.end(dot);
    return dot;
  },
};
