import { Compass } from 'ts-graphviz';
import { parse as _parse, SyntaxError } from './dot.pegjs';

export namespace AST {
  type ValueOf<T> = T[keyof T];

  export const Types = Object.freeze({
    Graph: 'graph',
    Attribute: 'attribute',
    Attributes: 'attributes',
    Edge: 'edge',
    Node: 'node',
    Subgraph: 'subgraph',
  } as const);
  export type Types = ValueOf<typeof Types>;

  export interface Graph {
    type: typeof Types.Graph;
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
    type: typeof Types.Attribute;
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
    type: typeof Types.Attributes;
    target: Attributes.Target;
    attributes: KeyValue[];
  }

  export interface ID {
    id: string;
    port?: string;
    commpass?: Compass;
  }

  export interface Edge {
    type: typeof Types.Edge;
    targets: ID[];
    attributes: KeyValue[];
  }

  export interface Node {
    type: typeof Types.Node;
    id: string;
    attributes: KeyValue[];
  }

  export interface Subgraph {
    type: typeof Types.Subgraph;
    id?: string;
    children: GraphObject[];
  }

  export type GraphObject = Attribute | Attributes | Edge | Node | Subgraph;

  /**
   * The basic usage is the same as the `parse` function,
   * except that it returns the dot language AST.
   *
   * ```ts
   * import { inspect } from 'util';
   * import { AST } from '@ts-graphviz/parser';
   *
   * const ast = AST.parse(`
   *   strict digraph example {
   *     subgraph cluster_0 {
   *       label="Subgraph A";
   *       a -> b -> c -> d;
   *     }
   *
   *     subgraph cluster_1 {
   *       label="Subgraph B";
   *       a -> f;
   *       f -> c;
   *     }
   *   }
   * `);
   *
   * console.log(inspect(ast, false, 6));
   * ```
   *
   * In the case of the above code, the structure of AST is as follows.
   *
   * ```ts
   * {
   *   kind: 'graph',
   *   id: 'example',
   *   directed: true,
   *   strict: true,
   *   children: [
   *     {
   *       kind: 'subgraph',
   *       id: 'cluster_0',
   *       children: [
   *         { kind: 'attribute', key: 'label', value: 'Subgraph A' },
   *         {
   *           kind: 'edge',
   *           targets: [ { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' } ],
   *           attributes: []
   *         }
   *       ]
   *     },
   *     {
   *       kind: 'subgraph',
   *       id: 'cluster_1',
   *       children: [
   *         { kind: 'attribute', key: 'label', value: 'Subgraph B' },
   *         {
   *           kind: 'edge',
   *           targets: [ { id: 'a' }, { id: 'f' } ],
   *           attributes: []
   *         },
   *         {
   *           kind: 'edge',
   *           targets: [ { id: 'f' }, { id: 'c' } ],
   *           attributes: []
   *         }
   *       ]
   *     }
   *   ]
   * }
   * ```
   * @throws {SyntaxError}
   */
  export function parse(dot: string): Graph {
    try {
      return _parse(dot);
    } catch (error) {
      Object.setPrototypeOf(error, SyntaxError.prototype);
      throw error;
    }
  }
}
