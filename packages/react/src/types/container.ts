import type { GraphBaseModel, RootGraphModel } from 'ts-graphviz';

/**
 * Type that represents any graph-like container that can be used for rendering.
 * This includes both base interfaces (GraphBaseModel) and root graph interfaces (RootGraphModel).
 * Since Graph and Digraph implement RootGraphModel, they are covered by this union.
 */
export type AnyGraphContainer = GraphBaseModel | RootGraphModel;