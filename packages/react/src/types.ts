import { ReactElement } from 'react';
import {
  EdgeAttributes,
  NodeAttributes,
  ClusterSubgraphAttributes,
  IRootCluster,
  RootClusterAttributes,
  EdgeTargetLike,
  EdgeTargetsLike,
  IHasComment,
  attribute,
} from 'ts-graphviz';

export interface IContext {
  root?: IRootCluster;
}

export interface ClusterAttributesProps {
  edge?: EdgeAttributes;
  node?: NodeAttributes;
  graph?: ClusterSubgraphAttributes;
}

export interface RootClusterProps
  extends Omit<RootClusterAttributes, typeof attribute.comment>,
    ClusterAttributesProps,
    IHasComment {
  id?: string;
}

export interface SubgraphProps
  extends Omit<ClusterSubgraphAttributes, typeof attribute.comment>,
    ClusterAttributesProps,
    IHasComment {
  id?: string;
}

export interface EdgeProps extends Omit<EdgeAttributes, typeof attribute.comment>, IHasComment {
  targets: (EdgeTargetLike | EdgeTargetsLike)[];
}

export interface NodeProps extends Omit<NodeAttributes, typeof attribute.comment>, IHasComment {
  id: string;
}

export interface RootClusterComponentProps extends Omit<RootClusterProps, typeof attribute.label> {
  label?: ReactElement | string;
}

export interface EdgeComponentProps extends Omit<EdgeProps, typeof attribute.label> {
  label?: ReactElement | string;
}

export interface NodeComponentProps extends Omit<NodeProps, typeof attribute.label | typeof attribute.xlabel> {
  label?: ReactElement | string;
  xlabel?: ReactElement | string;
}

export interface SubgraphComponentProps extends Omit<SubgraphProps, typeof attribute.label> {
  label?: ReactElement | string;
}

export interface ClusterPortalComponentProps {
  name?: string;
}
