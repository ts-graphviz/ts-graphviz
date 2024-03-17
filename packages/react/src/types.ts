import {
  EdgeAttributesObject,
  EdgeTargetLikeTuple,
  GraphAttributesObject,
  HasComment,
  NodeAttributesObject,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';
import { ReactElement, ReactNode } from 'react';
import { DOT } from './labels.js';

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
  label?: ReactElement<DOT> | string;
}

/** Props for Node component */
export interface NodeProps extends Omit<NodeOptions, 'label' | 'xlabel'> {
  /** Node id */
  id: string;
  /** Node label */
  label?: ReactElement<any, DOT> | string;
  /** Node xlabel */
  xlabel?: ReactElement<any, DOT> | string;
}

/** Props for Subgraph component */
export interface SubgraphProps extends Omit<SubgraphOptions, 'label'> {
  /** Subgraph label */
  label?: ReactElement<any, DOT> | string;
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
