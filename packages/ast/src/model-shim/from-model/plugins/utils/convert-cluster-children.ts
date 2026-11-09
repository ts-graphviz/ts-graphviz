import type { ReadonlyGraphBaseModel } from '@ts-graphviz/common';
import type { ClusterStatementASTNode } from '../../../../types.js';
import type { ConvertFromModelContext } from '../../types.js';
import { convertAttributes } from './convert-attribute.js';
import { commentsOf, convertComments } from './convert-comment.js';

export function convertClusterChildren(
  context: ConvertFromModelContext,
  model: ReadonlyGraphBaseModel,
): ClusterStatementASTNode[] {
  const { createElement, commentKind } = context;
  return Array.from(
    (function* (): Generator<ClusterStatementASTNode> {
      yield* convertAttributes(createElement, model);
      for (const attrs of Object.values(model.attributes)) {
        // A list with neither attributes nor comments writes nothing.
        if (
          attrs.getAttributeNames().length > 0 ||
          commentsOf(attrs).length > 0
        ) {
          yield* convertComments(createElement, attrs, 'leading', commentKind);
          yield context.convert(attrs);
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
        yield context.convert(statement);
      }
      // The comments at the end of the body.
      yield* convertComments(createElement, model, 'end', commentKind);
    })(),
  );
}
