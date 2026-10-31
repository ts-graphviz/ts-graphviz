import { type DotObjectModel, ownOptions, withCode } from '@ts-graphviz/common';
import { createElementFactory } from '../../builder/create-element.js';
import { defaultPlugins } from './plugins/index.js';
import type {
  ConvertFromModelContext,
  ConvertFromModelOptions,
  ConvertFromModelPlugin,
  ModelToAST,
} from './types.js';

/**
 * FromModelConverter is a class used to convert a {@link DotObjectModel} into an ASTNode.
 *
 * @group Convert Model to AST
 */
export class FromModelConverter {
  /** @hidden */
  #plugins: ConvertFromModelPlugin<DotObjectModel>[] = [...defaultPlugins];

  constructor(private options: ConvertFromModelOptions = {}) {
    // Own properties only: an inherited one is never an option (#1757).
    this.options = ownOptions(options);
  }

  /**
   * Converts a DotObjectModel into an AST.
   *
   * @param model The {@link DotObjectModel} to be converted.
   * @returns The AST generated from the model.
   */
  public convert<T extends DotObjectModel>(model: T): ModelToAST<T> {
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
      convert<U extends DotObjectModel>(m: U): ModelToAST<U> {
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
            open.add(m);
            try {
              return plugin.convert(context, m) as ModelToAST<U>;
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
    return context.convert(model);
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
