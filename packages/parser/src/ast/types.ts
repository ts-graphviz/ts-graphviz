import { Compass } from 'ts-graphviz';

type ValueOf<T> = T[keyof T];

export const Kinds = Object.freeze({
  Graph: 'graph',
  Attribute: 'attribute',
  Attributes: 'attributes',
  Edge: 'edge',
  Node: 'node',
  Subgraph: 'subgraph',
} as const);
export type Kinds = ValueOf<typeof Kinds>;

export interface Graph {
  kind: typeof Kinds.Graph;
  id?: string;
  directed: boolean;
  strict: boolean;
  children: GraphObject[];
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface Attribute extends KeyValue {
  kind: typeof Kinds.Attribute;
}

export namespace Attributes {
  export const Target = Object.freeze({
    Graph: 'graph',
    Edge: 'edge',
    Node: 'node',
  } as const);
  export type Target = ValueOf<typeof Target>;
}

export interface Attributes {
  kind: typeof Kinds.Attributes;
  target: Attributes.Target;
  attributes: KeyValue[];
}

export interface NodeID {
  id: string;
  port?: string;
  commpass?: Compass;
}

export interface Edge {
  kind: typeof Kinds.Edge;
  targets: NodeID[];
  attributes: KeyValue[];
}

export interface Node {
  kind: typeof Kinds.Node;
  id: string;
  attributes: KeyValue[];
}

export interface Subgraph {
  kind: typeof Kinds.Subgraph;
  id?: string;
  children: GraphObject[];
}

export type GraphObject = Attribute | Attributes | Edge | Node | Subgraph;
