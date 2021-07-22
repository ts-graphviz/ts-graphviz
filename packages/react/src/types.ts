import { ReactElement } from 'react';
import {
  EdgeAttributes,
  NodeAttributes,
  ClusterSubgraphAttributes,
  RootClusterAttributes,
  IHasComment,
  attribute,
  EdgeTargetLikeTuple,
} from 'ts-graphviz';

/** Common attribute values of objects under cluster */
export interface ClusterCommonAttributesProps {
  /** Attribute value for Edges */
  edge?: EdgeAttributes;
  /** Attribute value for Nodes */
  node?: NodeAttributes;
  /** Attribute value for Graphs */
  graph?: ClusterSubgraphAttributes;
}

/** Options for RootCluster */
export interface RootClusterOptions
  extends Omit<RootClusterAttributes, typeof attribute.comment>,
    ClusterCommonAttributesProps,
    IHasComment {
  /** Cluster id */
  id?: string;
}

/** Options for Subgraph */
export interface SubgraphOptions
  extends Omit<ClusterSubgraphAttributes, typeof attribute.comment>,
    ClusterCommonAttributesProps,
    IHasComment {
  /** Cluster id */
  id?: string;
}

/** Options for Edge */
export interface EdgeOptions extends Omit<EdgeAttributes, typeof attribute.comment>, IHasComment {}

/** Options for Node */
export interface NodeOptions extends Omit<NodeAttributes, typeof attribute.comment>, IHasComment {}

/** Props for RootCluster component */
export interface RootClusterProps extends Omit<RootClusterOptions, typeof attribute.label> {
  label?: ReactElement | string;
}

/** Props for Edge component */
export interface EdgeProps extends Omit<EdgeOptions, typeof attribute.label> {
  /** Edge targets */
  targets: EdgeTargetLikeTuple;
  /** Edge label */
  label?: ReactElement | string;
}

/** Props for Node component */
export interface NodeProps extends Omit<NodeOptions, typeof attribute.label | typeof attribute.xlabel> {
  /** Node id */
  id: string;
  /** Node label */
  label?: ReactElement | string;
  /** Node xlabel */
  xlabel?: ReactElement | string;
}

/** Props for Subgraph component */
export interface SubgraphProps extends Omit<SubgraphOptions, typeof attribute.label> {
  /** Subgraph label */
  label?: ReactElement | string;
}

/** Props for ClusterPortal component */
export interface ClusterPortalProps {
  /**
   * id of the cluster you want to target for the portal.
   * If not specified, target the cluster that is the container to the portal.
   */
  id?: string;
}
