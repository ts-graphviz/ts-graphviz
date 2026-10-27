import type { ReadonlyGraphBaseModel } from '@ts-graphviz/common';
import type { ClusterStatementASTNode } from '../../../../types.js';
import type { ConvertFromModelContext } from '../../types.js';
import { convertAttribute } from './convert-attribute.js';
import { convertComment } from './convert-comment.js';

export function convertClusterChildren(
  context: ConvertFromModelContext,
  model: ReadonlyGraphBaseModel,
): ClusterStatementASTNode[] {
  const { createElement } = context;
  return Array.from(
    (function* (): Generator<ClusterStatementASTNode> {
      for (const [key, value] of model.values) {
        yield convertAttribute(createElement, key, value);
      }
      for (const attrs of Object.values(model.attributes)) {
        if (attrs.size > 0) {
          if (attrs.comment !== undefined) {
            yield convertComment(
              createElement,
              attrs.comment,
              context.commentKind,
            );
          }
          yield context.convert(attrs);
        }
      }
      // Nodes, edges and subgraphs (and, for model classes that keep them
      // in place, default attribute lists) in the order they were added.
      for (const statement of model.statements) {
        if (statement.comment !== undefined) {
          yield convertComment(
            createElement,
            statement.comment,
            context.commentKind,
          );
        }
        yield context.convert(statement);
      }
    })(),
  );
}
