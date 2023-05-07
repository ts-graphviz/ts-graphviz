import { DotASTNode } from '../../../types.js';
import { CommentHolder } from './utils/comment-holder.js';
import { ConvertToModelPlugin } from '../types.js';

export const DotPlugin: ConvertToModelPlugin<DotASTNode> = {
  match(ast) {
    return ast.type === 'Dot';
  },
  convert(context, ast) {
    const commentHolder = new CommentHolder();
    for (const stmt of ast.children) {
      switch (stmt.type) {
        case 'Comment':
          commentHolder.set(stmt);
          break;
        case 'Graph':
          const graph = context.convert(stmt);
          commentHolder.apply(graph, stmt.location);
          return graph;
      }
    }
    throw Error();
  },
};
