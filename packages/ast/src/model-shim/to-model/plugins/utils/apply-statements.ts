import type { GraphBaseModel } from '@ts-graphviz/common';
import type {
  AttributeASTNode,
  ClusterStatementASTNode,
} from '../../../../types.js';
import type { ConvertToModelContext } from '../../types.js';
import { CommentHolder } from './comment-holder.js';

export function applyStatements(
  context: ConvertToModelContext,
  graph: GraphBaseModel,
  statements: ClusterStatementASTNode[],
): void {
  const commentHolder = new CommentHolder();
  for (const stmt of statements) {
    switch (stmt.type) {
      case 'Subgraph': {
        const subgraph = stmt.id
          ? graph.subgraph(stmt.id.value)
          : graph.subgraph();
        applyStatements(context, subgraph, stmt.children);
        commentHolder.apply(subgraph, stmt.location);
        break;
      }
      case 'Attribute':
        graph.set(
          stmt.key.value,
          stmt.value.quoted === 'html'
            ? `<${stmt.value.value}>`
            : stmt.value.value,
        );
        commentHolder.reset();
        break;
      case 'Node': {
        const node = context.convert(stmt);
        commentHolder.apply(node, stmt.location);
        graph.addNode(node);
        break;
      }
      case 'Edge': {
        const edge = context.convert(stmt);
        commentHolder.apply(edge, stmt.location);
        graph.addEdge(edge);
        break;
      }
      case 'AttributeList': {
        const attrs = stmt.children
          .filter<AttributeASTNode>(
            (v): v is AttributeASTNode => v.type === 'Attribute',
          )
          .reduce<Record<string, string | number | boolean>>((acc, curr) => {
            if (curr.value.quoted === 'html') {
              acc[curr.key.value] = `<${curr.value.value}>`;
            } else {
              acc[curr.key.value] = curr.value.value;
            }
            return acc;
          }, {});
        switch (stmt.kind) {
          case 'Edge':
            graph.edge(attrs);
            break;
          case 'Node':
            graph.node(attrs);
            break;
          case 'Graph':
            graph.graph(attrs);
            break;
        }
        commentHolder.reset();
        break;
      }
      case 'Comment':
        commentHolder.set(stmt);
    }
  }
}
