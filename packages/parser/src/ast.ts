import { Compass } from 'ts-graphviz';
import { parse as _parse } from './dot.peggy';

/**
 * The `AST` module provides the ability to handle the AST as a result of parsing the dot language
 * for lower level operations.
 *
 * @alpha
 */
export namespace AST {
  type ValueOf<T> = T[keyof T];

  /**
   * DOT object types.
   */
  export const Types = Object.freeze({
    Graph: 'graph',
    Attribute: 'attribute',
    Attributes: 'attributes',
    Edge: 'edge',
    Node: 'node',
    Subgraph: 'subgraph',
    ClusterStatements: 'cluster_statements',
  } as const);
  export type Types = ValueOf<typeof Types>;

  /**
   * AST node.
   */
  export interface ASTBaseNode {
    /**
     * Every leaf interface that extends ASTBaseNode
     * must specify a type property.
     */
    type: string;
  }

  export interface ASTBaseCluster extends ASTBaseNode {
    body: ClusterStatement[];
  }

  /**
   * Graph AST object.
   */
  export interface Graph extends ASTBaseCluster {
    type: typeof Types.Graph;
    id?: string;
    directed: boolean;
    strict: boolean;
  }

  export interface KeyValue {
    key: string;
    value: string;
  }

  /**
   * Attribute AST object.
   */
  export interface Attribute extends ASTBaseNode, KeyValue {
    type: typeof Types.Attribute;
  }

  /** Attributes AST object. */
  export namespace Attributes {
    export const Target = Object.freeze({
      Graph: 'graph',
      Edge: 'edge',
      Node: 'node',
    } as const);
    export type Target = ValueOf<typeof Target>;
  }

  export interface Attributes extends ASTBaseNode {
    type: typeof Types.Attributes;
    target: Attributes.Target;
    attributes: KeyValue[];
  }

  export interface ID {
    id: string;
    port?: string;
    commpass?: Compass;
  }

  /** Edge AST object. */
  export interface Edge extends ASTBaseNode {
    type: typeof Types.Edge;
    targets: ID[];
    attributes: KeyValue[];
  }

  /** Node AST object. */
  export interface Node extends ASTBaseNode {
    type: typeof Types.Node;
    id: string;
    attributes: KeyValue[];
  }

  /** Subgraph AST object. */
  export interface Subgraph extends ASTBaseCluster {
    type: typeof Types.Subgraph;
    id?: string;
  }

  export type ClusterStatement = Attribute | Attributes | Edge | Node | Subgraph;

  export type Rule =
    | typeof Types.Graph
    | typeof Types.Node
    | typeof Types.Edge
    | typeof Types.Attributes
    | typeof Types.Subgraph
    | typeof Types.Attribute
    | typeof Types.ClusterStatements;

  /**
   * Option interface for {@link AST.parse} function.
   */
  export interface ParseOption<T extends Rule = Rule> {
    rule?: T;
  }

  /**
   * The basic usage is the same as the `parse` function,
   * except that it returns the dot language AST.
   *
   * ```ts
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
   * console.log(ast);
   * // {
   * //   kind: 'graph',
   * //   id: 'example',
   * //   directed: true,
   * //   strict: true,
   * //   body: [
   * //     {
   * //       kind: 'subgraph',
   * //       id: 'cluster_0',
   * //       body: [
   * //         { kind: 'attribute', key: 'label', value: 'Subgraph A' },
   * //         {
   * //           kind: 'edge',
   * //           targets: [ { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' } ],
   * //           attributes: []
   * //         }
   * //       ]
   * //     },
   * //     {
   * //       kind: 'subgraph',
   * //       id: 'cluster_1',
   * //       body: [
   * //         { kind: 'attribute', key: 'label', value: 'Subgraph B' },
   * //         {
   * //           kind: 'edge',
   * //           targets: [ { id: 'a' }, { id: 'f' } ],
   * //           attributes: []
   * //         },
   * //         {
   * //           kind: 'edge',
   * //           targets: [ { id: 'f' }, { id: 'c' } ],
   * //           attributes: []
   * //         }
   * //       ]
   * //     }
   * //   ]
   * // }
   * ```
   *
   * @param dot string in the dot language to be parsed.
   * @param options.rule Object type of dot string.
   * This can be "graph", "subgraph", "node", "edge",
   * "attributes", "attribute", "cluster_statements".
   *
   * @example
   * import { AST } from '@ts-graphviz/parser';
   *
   * const ast = AST.parse(
   *   `test [
   *     style=filled;
   *     color=lightgrey;
   *     label = "example #1";
   *   ];`,
   *   { rule: 'node' },
   * );
   *
   * console.log(ast);
   * // {
   * //   type: 'node',
   * //   id: 'test',
   * //   attributes: [
   * //     { key: 'style', value: 'filled' },
   * //     { key: 'color', value: 'lightgrey' },
   * //     { key: 'label', value: 'example #1' }
   * //   ]
   * // }
   *
   * @returns The AST object of the parse result is returned.
   *
   * @throws {SyntaxError}
   */
  export function parse(dot: string): Graph;
  export function parse(dot: string, options: ParseOption<typeof Types.Edge>): Edge;
  export function parse(dot: string, options: ParseOption<typeof Types.Node>): Node;
  export function parse(dot: string, options: ParseOption<typeof Types.Graph>): Graph;
  export function parse(dot: string, options: ParseOption<typeof Types.Attribute>): Attribute;
  export function parse(dot: string, options: ParseOption<typeof Types.Attributes>): Attributes;
  export function parse(dot: string, options: ParseOption<typeof Types.Subgraph>): Subgraph;
  export function parse(dot: string, options: ParseOption<typeof Types.ClusterStatements>): ClusterStatement[];
  export function parse(dot: string, options: ParseOption): Graph | ClusterStatement | ClusterStatement[];
  export function parse(
    dot: string,
    { rule }: ParseOption = {},
  ): Graph | ClusterStatement | Subgraph | ClusterStatement[] {
    return _parse(dot, {
      startRule: rule,
    });
  }
}
