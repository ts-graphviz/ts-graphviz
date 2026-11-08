import type { ReadonlyGraphBaseModel } from '@ts-graphviz/common';
import type { ClusterStatementASTNode } from '../../../../types.js';
import type { ConvertFromModelContext } from '../../types.js';
import { convertAttributes } from './convert-attribute.js';
import { convertComments, withTrailingComments } from './convert-comment.js';

export function convertClusterChildren(
  context: ConvertFromModelContext,
  model: ReadonlyGraphBaseModel,
): ClusterStatementASTNode[] {
  const { createElement, commentKind } = context;
  return Array.from(
    (function* (): Generator<ClusterStatementASTNode> {
      yield* convertAttributes(createElement, model);
      for (const attrs of Object.values(model.attributes)) {
        if (attrs.getAttributeNames().length > 0) {
          yield* convertComments(createElement, attrs, 'leading', commentKind);
          yield withTrailingComments(
            createElement,
            context.convert(attrs),
            attrs,
            commentKind,
          );
        }
      }
      // Nodes, edges, subgraphs and default attribute lists in the order
      // they were added, each with its leading and trailing comments.
      for (const statement of model.statements) {
        yield* convertComments(
          createElement,
          statement,
          'leading',
          commentKind,
        );
        yield withTrailingComments(
          createElement,
          context.convert(statement),
          statement,
          commentKind,
        );
      }
      // The comments at the end of the body.
      yield* convertComments(createElement, model, 'end', commentKind);
    })(),
  );
}
