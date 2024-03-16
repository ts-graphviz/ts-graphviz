import { ReactElement, ReactNode } from 'react';
import {
  EdgeAttributesObject,
  EdgeTargetLikeTuple,
  GraphAttributesObject,
  HasComment,
  NodeAttributesObject,
  SubgraphAttributesObject,
  attribute,
} from 'ts-graphviz';
import { DOT } from './labels.js';

/** Common attribute values of objects under cluster */
export interface ClusterCommonAttributesProps {
  /** Attribute value for Edges */
  edge?: EdgeAttributesObject;
  /** Attribute value for Nodes */
  node?: NodeAttributesObject;
  /** Attribute value for Graphs */
  graph?: SubgraphAttributesObject;
}

/** Options for RootGraph */
export interface RootGraphOptions
  extends Omit<GraphAttributesObject, typeof attribute.comment>,
    ClusterCommonAttributesProps,
    HasComment {
  /** Cluster id */
  id?: string;
}

/** Options for Subgraph */
export interface SubgraphOptions
  extends Omit<SubgraphAttributesObject, typeof attribute.comment>,
    ClusterCommonAttributesProps,
    HasComment {
  /** Cluster id */
  id?: string;
}

/** Options for Edge */
export interface EdgeOptions
  extends Omit<EdgeAttributesObject, typeof attribute.comment>,
    HasComment {}

/** Options for Node */
export interface NodeOptions
  extends Omit<NodeAttributesObject, typeof attribute.comment>,
    HasComment {}

/** Props for RootGraph component */
export interface RootGraphProps
  extends Omit<RootGraphOptions, typeof attribute.label> {
  label?: ReactElement | string;
  children?: ReactNode;
}

/** Props for Edge component */
export interface EdgeProps extends Omit<EdgeOptions, typeof attribute.label> {
  /** Edge targets */
  targets: EdgeTargetLikeTuple;
  /** Edge label */
  label?: ReactElement<DOT> | string;
}

/** Props for Node component */
export interface NodeProps
  extends Omit<NodeOptions, typeof attribute.label | typeof attribute.xlabel> {
  /** Node id */
  id: string;
  /** Node label */
  label?: ReactElement<any, DOT> | string;
  /** Node xlabel */
  xlabel?: ReactElement<any, DOT> | string;
}

/** Props for Subgraph component */
export interface SubgraphProps
  extends Omit<SubgraphOptions, typeof attribute.label> {
  /** Subgraph label */
  label?: ReactElement<any, DOT> | string;
  children?: ReactNode;
}

/** Props for ClusterPortal component */
export interface ClusterPortalProps {
  /**
   * id of the cluster you want to target for the portal.
   * If not specified, target the cluster that is the container to the portal.
   */
  id?: string;
  children?: ReactNode;
}
