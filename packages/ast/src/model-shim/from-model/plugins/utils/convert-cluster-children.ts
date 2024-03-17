import type { GraphBaseModel } from '@ts-graphviz/common';
import type { ClusterStatementASTNode } from '../../../../types.js';
import type { ConvertFromModelContext } from '../../types.js';
import { convertAttribute } from './convert-attribute.js';
import { convertComment } from './convert-comment.js';

export function convertClusterChildren(
  context: ConvertFromModelContext,
  model: GraphBaseModel,
) {
  return Array.from(
    (function* (): Generator<ClusterStatementASTNode> {
      for (const [key, value] of model.values) {
        yield convertAttribute(key, value);
      }
      for (const attrs of Object.values(model.attributes)) {
        if (attrs.size > 0) {
          if (attrs.comment) {
            yield convertComment(attrs.comment, context.commentKind);
          }
          yield context.convert(attrs);
        }
      }
      for (const node of model.nodes) {
        if (node.comment) {
          yield convertComment(node.comment, context.commentKind);
        }
        yield context.convert(node);
      }
      for (const subgraph of model.subgraphs) {
        if (subgraph.comment) {
          yield convertComment(subgraph.comment, context.commentKind);
        }
        yield context.convert(subgraph);
      }
      for (const edge of model.edges) {
        if (edge.comment) {
          yield convertComment(edge.comment, context.commentKind);
        }
        yield context.convert(edge);
      }
    })(),
  );
}
