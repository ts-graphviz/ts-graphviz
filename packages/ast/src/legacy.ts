/**
 * The conversion of 3.x, for the deprecated models of `ts-graphviz/legacy`,
 * which use it.
 *
 * @deprecated In DOT each declaration of a node or a subgraph is one of its
 * own; use `toModel` of `@ts-graphviz/ast`. Removed in v5.
 * @module @ts-graphviz/ast/legacy
 * @beta
 */

export * from './model-shim/to-model/legacy-to-model.js';
