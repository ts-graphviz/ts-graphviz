import {
  type AnyReadonlyDotObjectModel,
  type ModelOf,
  type ModelView,
  modelOf,
  ownOptions,
  withCode,
} from '@ts-graphviz/common';
import { createElementFactory } from '../../builder/create-element.js';
import { defaultPlugins } from './plugins/index.js';
import {
  checkCommentPositions,
  withLeadingComments,
  withTrailingComments,
} from './plugins/utils/convert-comment.js';
import type {
  ConvertFromModelContext,
  ConvertFromModelOptions,
  ConvertFromModelPlugin,
  ModelToAST,
} from './types.js';

/**
 * FromModelConverter is a class used to convert a model into an ASTNode.
 *
 * It only reads the model, so it takes any model
 * ({@link AnyReadonlyDotObjectModel}): the built-in ones, custom model
 * classes and the read-only views; or an object standing for one
 * ({@link ModelView}, such as the DOT DSL of `ts-graphviz`).
 *
 * @group Convert Model to AST
 */
export class FromModelConverter {
  /** @hidden */
  #plugins: ConvertFromModelPlugin<AnyReadonlyDotObjectModel>[] = [
    ...defaultPlugins,
  ];

  constructor(private options: ConvertFromModelOptions = {}) {
    // Own properties only: an inherited one is never an option (#1757).
    this.options = ownOptions(options);
  }

  /**
   * Converts a model into an AST.
   *
   * @param model The model to be converted.
   * @returns The AST generated from the model.
   */
  public convert<T extends AnyReadonlyDotObjectModel | ModelView>(
    model: T,
  ): ModelToAST<ModelOf<T>> {
    const plugins = [...this.#plugins];
    const { commentKind = 'Slash', maxASTNodes } = this.options;
    const createElement = createElementFactory({ maxASTNodes });
    // The models being converted, from the one passed in to the innermost:
    // a model among its own statements (`s.addSubgraph(s)`) would be
    // converted until the call stack runs out. A model reached again
    // elsewhere is converted again, and every AST node that makes counts
    // toward `maxASTNodes`.
    const open = new Set<unknown>();
    const context: ConvertFromModelContext = {
      commentKind,
      createElement,
      convert<U extends AnyReadonlyDotObjectModel>(m: U): ModelToAST<U> {
        if (open.has(m)) {
          throw withCode(
            new TypeError(
              `The ${describeType(m.$$type)} model contains itself: it is among its own statements`,
            ),
            'TSG_ERR_CYCLIC_STRUCTURE',
          );
        }
        for (const plugin of plugins) {
          if (plugin.match(m)) {
            checkCommentPositions(m);
            open.add(m);
            try {
              // The model's trailing comments go on the node it becomes,
              // whoever converts it (a parent, or this call).
              return withTrailingComments(
                createElement,
                plugin.convert(context, m),
                m,
                commentKind,
              ) as ModelToAST<U>;
            } finally {
              open.delete(m);
            }
          }
        }
        throw withCode(
          new Error(
            `No plugin can convert the ${describeType(m.$$type)} model to an AST node`,
          ),
          'TSG_ERR_NO_PLUGIN',
        );
      },
    };
    const root = modelOf(model) as AnyReadonlyDotObjectModel;
    const ast = context.convert(root);
    // A parent (a body, or the DOT source for a root graph) writes the
    // leading comments of what it holds before it; a model converted alone
    // carries its own.
    return (
      root.$$type === 'Dot'
        ? ast
        : withLeadingComments(createElement, ast, root, commentKind)
    ) as ModelToAST<ModelOf<T>>;
  }
}

/**
 * A model's `$$type` for a message: a string as it is (shortened), anything
 * else by its type, so describing it runs no code of the value's.
 */
function describeType(type: unknown): string {
  return typeof type === 'string'
    ? JSON.stringify(type.slice(0, 64))
    : `(${typeof type})`;
}
