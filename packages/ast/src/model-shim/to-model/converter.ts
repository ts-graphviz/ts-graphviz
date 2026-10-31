import { ownOptions, withCode } from '@ts-graphviz/common';
import { checkReferences } from '../../references.js';
import { startEdgeTargetBudget } from './edge-target-budget.js';
import { defaultPlugins } from './plugins/index.js';
import type {
  ASTToModel,
  ConvertToModelContext,
  ConvertToModelOptions,
  ConvertToModelPlugin,
  ToModelConvertableASTNode,
} from './types.js';

/**
 * @group Convert AST to Model
 */
export class ToModelConverter {
  /** @hidden */
  protected plugins: ConvertToModelPlugin<ToModelConvertableASTNode>[] = [
    ...defaultPlugins,
  ];

  constructor(private options: ConvertToModelOptions) {
    // Own properties only: an inherited one is never an option (#1757).
    this.options = ownOptions(options);
  }

  /**
   * Convert AST to Model.
   *
   * @param ast AST node.
   */
  public convert<T extends ToModelConvertableASTNode>(ast: T): ASTToModel<T> {
    const plugins = [...this.plugins];
    const context: ConvertToModelContext = {
      models: this.options.models,
      convert<U extends ToModelConvertableASTNode>(m: U): ASTToModel<U> {
        for (const plugin of plugins) {
          if (plugin.match(m)) {
            return plugin.convert(context, m) as ASTToModel<U>;
          }
        }
        // The type only, and without running code of the value's.
        const type: unknown = (m as { type?: unknown }).type;
        throw withCode(
          new Error(
            `No plugin can convert the ${typeof type === 'string' ? JSON.stringify(type.slice(0, 64)) : `(${typeof type})`} AST node to a model`,
          ),
          'TSG_ERR_NO_PLUGIN',
        );
      },
    };
    // An AST that contains itself would be converted until the call stack
    // runs out, and one that shares nodes between parents is converted
    // once for each place.
    checkReferences(ast, this.options.maxSharedNodes);
    startEdgeTargetBudget(context, this.options.maxEdgeTargets);
    return context.convert(ast);
  }
}
