import type { FC, ComponentProps as ReactComponentProps } from 'react';
import type { AnyDotObjectModel } from 'ts-graphviz';
import type { Context } from '../contexts/GraphvizContext.js';
import type { AnyGraphContainer } from './container.js';

/**
 * React component type for Graphviz elements
 */
export type ComponentType = FC<any>;

/**
 * Props for Graphviz components
 */
export type ComponentProps = ReactComponentProps<any>;

/**
 * Container represents the rendering container info with typed model collection
 */
export interface RenderContainer<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  renderedModels: AnyDotObjectModel[];
  /** Errors no error boundary caught during the current render. */
  uncaughtErrors: unknown[];
  context?: Context<Container>;
  __rootInstance?: ReconcilerInstance | TextInstance;
}

/**
 * Instance represents a rendered Graphviz element (Node, Edge, Subgraph, etc.)
 */
export interface ReconcilerInstance {
  type: string;
  props: ComponentProps;
  children: (ReconcilerInstance | TextInstance)[];
  appendChild?: (child: ReconcilerInstance | TextInstance) => void;
}

/**
 * Text instance for string content
 */
export type TextInstance = string;

/**
 * Public instance exposed to user code
 */
export type PublicInstance = ReconcilerInstance | TextInstance;

/**
 * Host context for rendering
 */
export type HostContext = Record<string, never>;
