import { Compass } from '../types';

type ValueOf<T> = T[keyof T];

export const Kinds = Object.freeze({
  Graph: 'graph',
  Attr: 'attr',
  Attrs: 'attrs',
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

export interface Attr extends KeyValue {
  kind: typeof Kinds.Attr;
}

export namespace Attrs {
  export const Target = Object.freeze({
    Graph: 'graph',
    Edge: 'edge',
    Node: 'node',
  } as const);
  export type Target = ValueOf<typeof Target>;
}

export interface Attrs {
  kind: typeof Kinds.Attrs;
  target: Attrs.Target;
  attrs: KeyValue[];
}

export interface NodeID {
  id: string;
  port?: string;
  commpass?: Compass;
}

export interface Edge {
  kind: typeof Kinds.Edge;
  targets: NodeID[];
  attrs: KeyValue[];
}

export interface Node {
  kind: typeof Kinds.Node;
  id: string;
  attrs: KeyValue[];
}

export interface Subgraph {
  kind: typeof Kinds.Subgraph;
  id?: string;
  children: GraphObject[];
}

export type GraphObject = Attr | Attrs | Edge | Node | Subgraph;
