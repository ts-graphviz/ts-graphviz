import type { FC, ComponentProps as ReactComponentProps } from 'react';
import type {
  AnyDotObjectModel,
  EdgeModel,
  NodeModel,
  SubgraphModel,
} from 'ts-graphviz';
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
 * What React renders one tree into: the host instances of the top level,
 * and how the commit reaches the models and the code that started the
 * render.
 */
export interface RenderContainer<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  renderedModels: AnyDotObjectModel[];
  context?: Context<Container>;
  /** The host instances rendered at the top level, in element order. */
  children: Child[];
  /**
   * What the tree added to each graph. A tree that takes the place of one
   * that was lost shares it, and so replaces what that one left; when a
   * conversion is done it is dropped, and the models are the graph's own.
   */
  added: AddedStatements;
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

/** What a tree added to each graph: the statements, in the order added. */
export type AddedStatements = Map<
  AnyGraphContainer,
  (NodeModel | EdgeModel | SubgraphModel)[]
>;

interface InstanceBase {
  /** Hidden by a Suspense boundary that shows its fallback again. */
  hidden: boolean;
}

/**
 * A host `<Node>`. Its model is made at the first commit that shows it, by
 * the graph it goes to.
 */
export interface NodeInstance extends InstanceBase {
  kind: 'node';
  props: ComponentProps;
  model?: NodeModel;
}

/** A host `<Edge>`, made like a node. */
export interface EdgeInstance extends InstanceBase {
  kind: 'edge';
  props: ComponentProps;
  model?: EdgeModel;
}

/**
 * A host `<Digraph>`, `<Graph>` or `<Subgraph>`. The model comes from the
 * component, which makes it during render (without adding it anywhere) so
 * that `useCurrentGraph` can return it to the children.
 */
interface GraphInstance extends InstanceBase {
  kind: 'graph';
  model: AnyGraphContainer;
  children: Child[];
}

/** A host `<GraphPortal>`: its children go to the graph it names. */
interface PortalInstance extends InstanceBase {
  kind: 'portal';
  id: string | undefined;
  children: Child[];
}

/** Text between the elements; it is not part of the graph. */
export interface TextInstance extends InstanceBase {
  kind: 'text';
}

export type ReconcilerInstance =
  | NodeInstance
  | EdgeInstance
  | GraphInstance
  | PortalInstance;

export type Child = ReconcilerInstance | TextInstance;

/** What a `ref` on a host element resolves to: the model. */
export type PublicInstance = AnyDotObjectModel | null;

export interface HostContext {
  /** Inside a graph, where nodes and edges can be rendered. */
  inGraph: boolean;
}
