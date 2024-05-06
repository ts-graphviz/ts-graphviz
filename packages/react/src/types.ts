import type {
  EdgeAttributesObject,
  EdgeTargetLikeTuple,
  GraphAttributesObject,
  HTMLLikeLabel,
  HasComment,
  NodeAttributesObject,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';
import type { ReactElement, ReactNode } from 'react';
export type { ReactNode } from 'react';

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
}

/** Props for Edge component */
export interface EdgeProps extends Omit<EdgeOptions, 'label'> {
  /** Edge targets */
  targets: EdgeTargetLikeTuple;
  /** Edge label */
  label?: ReactElement | string;
}

/** Props for Node component */
export interface NodeProps extends Omit<NodeOptions, 'label' | 'xlabel'> {
  /** Node id */
  id: string;
  /** Node label */
  label?: ReactElement | string;
  /** Node xlabel */
  xlabel?: ReactElement | string;
}

/** Props for Subgraph component */
export interface SubgraphProps extends Omit<SubgraphOptions, 'label'> {
  /** Subgraph label */
  label?: ReactElement | string;
  children?: ReactNode;
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
 * Namespaced JSX elements for React.
 *
 * See details for <https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript>
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
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
  }
}
