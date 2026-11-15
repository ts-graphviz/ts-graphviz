import type { FC, ComponentProps as ReactComponentProps } from 'react';
import type { AnyDotObjectModel } from 'ts-graphviz';
import type { AnyGraphContainer, Tree } from '../shared/tree.js';

/**
 * React component type for Graphviz elements
 */
export type ComponentType = FC<any>;

/**
 * Props for Graphviz components
 */
export type ComponentProps = ReactComponentProps<any>;

/**
 * What React renders one tree into: the tree of host instances, and how
 * the commit reaches the code that started the render.
 */
export interface RenderContainer<
  Container extends AnyGraphContainer = AnyGraphContainer,
> extends Tree {
  readonly container: Container | undefined;
  /**
   * Whether commits still reach the models. A tree that was given up (its
   * render failed, was aborted, or is done) is unmounted without touching
   * them.
   */
  active: boolean;
  /** The models match the instances of a commit. */
  onCommit(): void;
  /** Making the models match threw (a model class did); never throws. */
  onSyncError(error: unknown): void;
}

/** What a `ref` on a host element resolves to: the model. */
export type PublicInstance = AnyDotObjectModel | null;

export interface HostContext {
  /** Inside a graph, where nodes and edges can be rendered. */
  inGraph: boolean;
}
