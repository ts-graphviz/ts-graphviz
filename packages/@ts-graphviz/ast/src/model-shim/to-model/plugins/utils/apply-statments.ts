import { GraphBaseModel } from '@ts-graphviz/common';
import { ClusterStatementASTNode, AttributeASTNode } from '../../../../types.js';
import { CommentHolder } from './comment-holder.js';
import { convertToEdgeTargetTuple } from './convert-to-edge-target-tuple.js';

export function applyStatements(graph: GraphBaseModel, statements: ClusterStatementASTNode[]): void {
  const commentHolder = new CommentHolder();
  for (const stmt of statements) {
    switch (stmt.type) {
      case 'Subgraph':
        const subgraph = stmt.id ? graph.subgraph(stmt.id.value) : graph.subgraph();
        applyStatements(subgraph, stmt.children);
        commentHolder.apply(subgraph, stmt.location);
        break;
      case 'Attribute':
        graph.set(stmt.key.value, stmt.value.value);
        commentHolder.reset();
        break;
      case 'Node':
        commentHolder.apply(
          graph.node(
            stmt.id.value,
            stmt.children
              .filter<AttributeASTNode>((v): v is AttributeASTNode => v.type === 'Attribute')
              .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
          ),
          stmt.location,
        );
        break;
      case 'Edge':
        commentHolder.apply(
          graph.edge(
            convertToEdgeTargetTuple(stmt),
            stmt.children
              .filter<AttributeASTNode>((v): v is AttributeASTNode => v.type === 'Attribute')
              .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
          ),
          stmt.location,
        );
        break;
      case 'AttributeList':
        const attrs: { [key: string]: string } = stmt.children
          .filter<AttributeASTNode>((v): v is AttributeASTNode => v.type === 'Attribute')
          .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {});
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
      case 'Comment':
        commentHolder.set(stmt);
    }
  }
}
