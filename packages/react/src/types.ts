import type {
  EdgeAttributesObject,
  EdgeModel,
  EdgeTargetLikeTuple,
  GraphAttributesObject,
  GraphBaseModel,
  HasComment,
  HTMLLikeLabel,
  NodeAttributesObject,
  NodeModel,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';
import type { ReactElement, ReactNode, Ref } from 'react';

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
}

/** Options for Subgraph */
export interface SubgraphOptions
  extends SubgraphAttributesObject,
    GraphBaseAttributesProps,
    HasComment {
  /** Cluster id */
  id?: string;
}

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
  targets: EdgeTargetLikeTuple;
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
export interface SubgraphProps extends Omit<SubgraphOptions, 'label'> {
  /** Subgraph label */
  label?: ReactElement | string;
  children?: ReactNode;
  ref?: Ref<GraphBaseModel>;
}

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
 * JSX intrinsic elements for dot:* HTML-like elements.
 * These type definitions are automatically available when importing @ts-graphviz/react.
 */
export interface DotJSXElements {
  'dot:port': { children: string };
  'dot:table': HTMLLikeLabel.TableAttributes & { children?: ReactNode };
  'dot:tr': HTMLLikeLabel.TrAttributes & { children?: ReactNode };
  'dot:td': HTMLLikeLabel.TdAttributes & { children?: ReactNode };
  'dot:font': HTMLLikeLabel.FontAttributes & { children?: ReactNode };
  'dot:br': HTMLLikeLabel.BrAttributes;
  'dot:img': HTMLLikeLabel.ImgAttributes;
  'dot:i': HTMLLikeLabel.IAttributes & { children?: ReactNode };
  'dot:b': HTMLLikeLabel.BAttributes & { children?: ReactNode };
  'dot:u': HTMLLikeLabel.UAttributes & { children?: ReactNode };
  'dot:o': HTMLLikeLabel.OAttributes & { children?: ReactNode };
  'dot:sub': HTMLLikeLabel.SubAttributes & { children?: ReactNode };
  'dot:sup': HTMLLikeLabel.SupAttributes & { children?: ReactNode };
  'dot:s': HTMLLikeLabel.SAttributes & { children?: ReactNode };
  'dot:hr': HTMLLikeLabel.HrAttributes;
  'dot:vr': HTMLLikeLabel.VrAttributes;
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
