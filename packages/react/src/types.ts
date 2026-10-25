import type {
  EdgeAttributesObject,
  EdgeModel,
  GraphAttributesObject,
  GraphBaseModel,
  HasComment,
  HTMLLikeLabel,
  NodeAttributesObject,
  NodeModel,
  ReadonlyEdgeTargetLikeTuple,
  SubgraphAttributesFor,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';
import type { Attributes, ReactElement, ReactNode, Ref } from 'react';

// Re-export ReactNode to ensure it's available for JSX declarations
export type { ReactNode };

/** Common attribute values of objects under cluster */
export interface GraphBaseAttributesProps {
  /** Attribute value for Edges */
  edge?: EdgeAttributesObject;
  /** Attribute value for Nodes */
  node?: NodeAttributesObject;
  /** Attribute value for Graphs */
  graph?: SubgraphAttributesObject;
}

/** Options for RootGraph */
export interface RootGraphOptions
  extends GraphAttributesObject,
    GraphBaseAttributesProps {
  /** Cluster id */
  id?: string;
  /** Strict graph: at most one edge between a pair of nodes. */
  strict?: boolean;
}

/** Options for Subgraph */
/**
 * Options for Subgraph. Like `subgraph()`, the id picks the attributes
 * ({@link SubgraphAttributesFor}): cluster attributes for an id starting with
 * `cluster` (or with `cluster: true`), `rank` otherwise. Without a type
 * argument the id is not known, and either kind is accepted.
 */
export type SubgraphOptions<
  Id extends string | undefined = string | undefined,
> =
  // `id` and `comment` here are the subgraph's name and the model comment,
  // not the Graphviz attributes of the same names.
  DistributiveOmit<SubgraphAttributesFor<Id>, 'id' | 'comment'> &
    GraphBaseAttributesProps &
    HasComment & {
      /** Subgraph id; one starting with `cluster` makes a cluster. */
      id?: Id;
    };

/** Options for Edge */
export interface EdgeOptions extends EdgeAttributesObject {}

/** Options for Node */
export interface NodeOptions extends NodeAttributesObject {}

/** Props for RootGraph component */
export interface RootGraphProps extends Omit<RootGraphOptions, 'label'> {
  label?: ReactElement | string;
  children?: ReactNode;
  ref?: Ref<GraphBaseModel>;
}

/** Props for Edge component */
export interface EdgeProps extends Omit<EdgeOptions, 'label'> {
  /** Edge targets */
  targets: ReadonlyEdgeTargetLikeTuple;
  /** Edge label */
  label?: ReactElement | string;
  ref?: Ref<EdgeModel>;
}

/** Props for Node component */
export interface NodeProps extends Omit<NodeOptions, 'label' | 'xlabel'> {
  /** Node id */
  id: string;
  /** Node label */
  label?: ReactElement | string;
  /** Node xlabel */
  xlabel?: ReactElement | string;
  ref?: Ref<NodeModel>;
}

/** Props for Subgraph component */
/**
 * Props for Subgraph component: {@link SubgraphOptions}, with `label` taking
 * a React element (an HTML-like label) where a label applies.
 */
export type SubgraphProps<Id extends string | undefined = string | undefined> =
  WithReactLabel<SubgraphOptions<Id>> & {
    children?: ReactNode;
    ref?: Ref<GraphBaseModel>;
  };

/** `Omit` applied to each member of a union, so the union stays discriminated. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/**
 * Replaces `label` with a React element or string, in each union member that
 * takes a label (not in those where it is absent or `never`).
 */
type WithReactLabel<T> = T extends unknown
  ? T extends { label?: undefined }
    ? T
    : Omit<T, 'label'> & {
        /** Subgraph label */
        label?: ReactElement | string;
      }
  : never;

/** Props for GraphPortal component */
export interface GraphPortalProps {
  /**
   * id of the cluster you want to target for the portal.
   * If not specified, target the cluster that is the container to the portal.
   */
  id?: string;
  children?: ReactNode;
}

/**
 * Props every dot:* element with content takes besides its attributes:
 * its children and React's `key`.
 */
export interface DotElementProps extends Attributes {
  children?: ReactNode;
}

/**
 * JSX intrinsic elements for dot:* HTML-like elements.
 * These type definitions are automatically available when importing @ts-graphviz/react.
 */
export interface DotJSXElements {
  'dot:table': HTMLLikeLabel.TableAttributes & DotElementProps;
  'dot:tr': HTMLLikeLabel.TrAttributes & DotElementProps;
  'dot:td': HTMLLikeLabel.TdAttributes & DotElementProps;
  'dot:font': HTMLLikeLabel.FontAttributes & DotElementProps;
  'dot:br': HTMLLikeLabel.BrAttributes & Attributes;
  'dot:img': HTMLLikeLabel.ImgAttributes & Attributes;
  'dot:i': HTMLLikeLabel.IAttributes & DotElementProps;
  'dot:b': HTMLLikeLabel.BAttributes & DotElementProps;
  'dot:u': HTMLLikeLabel.UAttributes & DotElementProps;
  'dot:o': HTMLLikeLabel.OAttributes & DotElementProps;
  'dot:sub': HTMLLikeLabel.SubAttributes & DotElementProps;
  'dot:sup': HTMLLikeLabel.SupAttributes & DotElementProps;
  'dot:s': HTMLLikeLabel.SAttributes & DotElementProps;
  'dot:hr': HTMLLikeLabel.HrAttributes & Attributes;
  'dot:vr': HTMLLikeLabel.VrAttributes & Attributes;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends DotJSXElements {}
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends DotJSXElements {}
  }
}

export type { AnyGraphContainer } from './types/container.js';
// Re-export types for external use
export type { ComponentProps, ComponentType } from './types/reconciler.js';
