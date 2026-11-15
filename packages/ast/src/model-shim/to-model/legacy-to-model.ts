import { ToModelConverter } from './converter.js';
import { DotPlugin } from './plugins/DotPlugin.js';
import { EdgePlugin } from './plugins/EdgePlugin.js';
import { graphPlugin } from './plugins/GraphPlugin.js';
import { NodePlugin } from './plugins/NodePlugin.js';
import { subgraphPlugin } from './plugins/SubgraphPlugin.js';
import type {
  ASTToModel,
  ConvertToModelOptions,
  ToModelConvertableASTNode,
} from './types.js';

/** The plugins of {@link toModel}, with those of graphs as 3.x had them. */
class LegacyToModelConverter extends ToModelConverter {
  protected override plugins = [
    NodePlugin,
    EdgePlugin,
    subgraphPlugin(true),
    graphPlugin(true),
    DotPlugin,
  ];
}

/**
 * {@link toModel} as 3.x converted: a node or a subgraph declared again adds
 * to the first one with its id (`a [color=red]; a [shape=box]` is one node
 * with both), instead of being a declaration of its own.
 *
 * @deprecated For the 3.x models of `ts-graphviz/legacy`, which use it. In
 * DOT each declaration is one of its own; use {@link toModel}. Removed in v5.
 * @group Convert AST to Model
 */
export function legacyToModel<T extends ToModelConvertableASTNode>(
  ast: T,
  options: ConvertToModelOptions,
): ASTToModel<T> {
  return new LegacyToModelConverter(options).convert(ast);
}
