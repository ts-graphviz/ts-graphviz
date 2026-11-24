import type {
  AnyModelTypes,
  AttributeKey,
  DotObjectType,
  EdgeAttributesObject,
  EscStringValue,
  GraphAttributesObject,
  GraphBaseModel,
  HasComment,
  HTMLLikeLabel,
  ModelTypes,
  NodeAttributesObject,
  ReadonlyEdgeTargetLikeTuple,
  SchemaOf,
  SubgraphAttributesFor,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';
import type { Attributes, ReactElement, ReactNode, Ref } from 'react';

// Re-export ReactNode to ensure it's available for JSX declarations
export type { ReactNode };

/**
 * Common attribute values of objects under cluster.
 *
 * The props of the components take the model types `M` of the kit they
 * create with: their attributes are those of its schema, and their `ref`
 * gives its models. By default those of the default kit; components typed
 * with a kit come from `createComponents(kit)`.
 */
export interface GraphBaseAttributesProps<
  M extends AnyModelTypes = ModelTypes,
> {
  /** Attribute value for Edges */
  edge?: EdgeAttributesObject<SchemaOf<M>>;
  /** Attribute value for Nodes */
  node?: NodeAttributesObject<SchemaOf<M>>;
  /** Attribute value for Graphs */
  graph?: SubgraphAttributesObject<SchemaOf<M>>;
}

/** Options for RootGraph */
export type RootGraphOptions<M extends AnyModelTypes = ModelTypes> =
  GraphAttributesObject<SchemaOf<M>> &
    GraphBaseAttributesProps<M> & {
      /** Cluster id */
      id?: string;
      /** Strict graph: at most one edge between a pair of nodes. */
      strict?: boolean;
    };

/** Options for Subgraph */
/**
 * Options for Subgraph. Like `subgraph()`, the id picks the attributes
 * ({@link SubgraphAttributesFor}): cluster attributes for an id starting with
 * `cluster` (or with `cluster: true`), `rank` otherwise. Without a type
 * argument the id is not known, and either kind is accepted.
 */
export type SubgraphOptions<
  Id extends string | undefined = string | undefined,
  M extends AnyModelTypes = ModelTypes,
> =
  // `id` and `comment` here are the subgraph's name and the model comment,
  // not the Graphviz attributes of the same names.
  DistributiveOmit<SubgraphAttributesFor<Id, SchemaOf<M>>, 'id' | 'comment'> &
    GraphBaseAttributesProps<M> &
    HasComment & {
      /** Subgraph id; one starting with `cluster` makes a cluster. */
      id?: Id;
    };

/** Options for Edge */
export type EdgeOptions<M extends AnyModelTypes = ModelTypes> =
  EdgeAttributesObject<SchemaOf<M>>;

/** Options for Node */
export type NodeOptions<M extends AnyModelTypes = ModelTypes> =
  NodeAttributesObject<SchemaOf<M>>;

/** Props for RootGraph component */
export type RootGraphProps<M extends AnyModelTypes = ModelTypes> = Omit<
  RootGraphOptions<M>,
  'label'
> & {
  label?:
    | ReactElement
    | LabelValue<GraphAttributesObject<SchemaOf<M>>, 'label'>;
  children?: ReactNode;
  ref?: Ref<GraphRef<M, M['Graph'] | M['Digraph']>>;
};

/** Props for Edge component */
export type EdgeProps<M extends AnyModelTypes = ModelTypes> = Omit<
  EdgeOptions<M>,
  'label'
> & {
  /** Edge targets */
  targets: ReadonlyEdgeTargetLikeTuple;
  /** Edge label */
  label?: ReactElement | LabelValue<EdgeOptions<M>, 'label'>;
  ref?: Ref<M['Edge']>;
};

/** Props for Node component */
export type NodeProps<M extends AnyModelTypes = ModelTypes> = Omit<
  NodeOptions<M>,
  'label' | 'xlabel'
> & {
  /** Node id */
  id: string;
  /** Node label */
  label?: ReactElement | LabelValue<NodeOptions<M>, 'label'>;
  /** Node xlabel */
  xlabel?: ReactElement | LabelValue<NodeOptions<M>, 'xlabel'>;
  ref?: Ref<M['Node']>;
};

/** Props for Subgraph component */
/**
 * Props for Subgraph component: {@link SubgraphOptions}, with `label` taking
 * a React element (an HTML-like label) where a label applies.
 */
export type SubgraphProps<
  Id extends string | undefined = string | undefined,
  M extends AnyModelTypes = ModelTypes,
> = WithReactLabel<SubgraphOptions<Id, M>> & {
  children?: ReactNode;
  ref?: Ref<GraphRef<M, M['Subgraph']>>;
};

/**
 * A label prop's value besides a React element: a string where the type
 * takes strings (an escString or HTML-like value is given as a string or an
 * element instead), with the other members of the type the kit's schema
 * gives the attribute.
 */
type LabelValue<O, K extends string> = O extends {
  readonly [P in K]?: infer V;
}
  ? string extends Exclude<V, undefined>
    ? string | Exclude<V, undefined | string | EscStringValue | HTMLLikeLabel>
    : Exclude<V, undefined>
  : string;

/**
 * What the `ref` of a graph or subgraph component gives: the graph, typed
 * with the kit's schema, or a model of the kit's class.
 */
type GraphRef<M extends AnyModelTypes, Model> =
  | GraphBaseModel<DotObjectType, AttributeKey, SchemaOf<M>>
  | Model;

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
        label?: ReactElement | LabelValue<T, 'label'>;
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
