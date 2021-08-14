import { Compass } from 'ts-graphviz';
import { parse as _parse, IFileRange } from './dot.peggy';

/**
 * The `AST` module provides the ability to handle the AST as a result of parsing the dot language
 * for lower level operations.
 *
 * @alpha
 */
export namespace AST {
  export type FileRange = IFileRange;
  type ValueOf<T> = T[keyof T];

  /**
   * DOT object types.
   */
  export const Types = Object.freeze({
    Dot: 'dot',
    Comment: 'comment',
    Graph: 'graph',
    Attribute: 'attribute',
    Attributes: 'attributes',
    Edge: 'edge',
    Node: 'node',
    NodeRef: 'node_ref',
    NodeRefGroup: 'node_ref_group',
    Subgraph: 'subgraph',
    Literal: 'literal',
    ClusterStatements: 'cluster_statements',
  } as const);
  export type Types = ValueOf<typeof Types>;

  export function isASTBaseNode(value: unknown): value is ASTBaseNode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof value === 'object' && value !== null && typeof (value as any).type === 'string';
  }

  /**
   * AST node.
   */
  export interface ASTBaseNode {
    /**
     * Every leaf interface that extends ASTBaseNode
     * must specify a type property.
     */
    type: string;
    location: FileRange;
  }

  export interface ASTBaseParent<STMT extends ASTBaseNode = ASTBaseNode> extends ASTBaseNode {
    body: STMT[];
  }

  export interface Literal<T extends string = string> extends ASTBaseNode {
    type: typeof Types.Literal;
    value: T;
    quoted: boolean | 'html';
  }

  export interface Dot extends ASTBaseParent<DotStatement> {
    type: typeof Types.Dot;
  }

  /**
   * Graph AST object.
   */
  export interface Graph extends ASTBaseParent<ClusterStatement> {
    type: typeof Types.Graph;
    id?: Literal;
    directed: boolean;
    strict: boolean;
  }

  export interface KeyValue {
    key: Literal;
    value: Literal;
  }

  /**
   * Attribute AST object.
   */
  export interface Attribute extends ASTBaseNode, KeyValue {
    type: typeof Types.Attribute;
  }

  /**
   * Comment AST object.
   */
  export interface Comment extends ASTBaseNode {
    type: typeof Types.Comment;
    kind: Comment.Kind;
    value: string;
  }
  export namespace Comment {
    export const Kind = Object.freeze({
      Block: 'block',
      Slash: 'slash',
      Macro: 'macro',
    } as const);
    export type Kind = ValueOf<typeof Kind>;
  }

  /** Attributes AST object. */
  export interface Attributes extends ASTBaseParent<Attribute | Comment> {
    type: typeof Types.Attributes;
    kind: Attributes.Kind;
  }
  export namespace Attributes {
    export const Kind = Object.freeze({
      Graph: Types.Graph,
      Edge: Types.Edge,
      Node: Types.Node,
    } as const);
    export type Kind = ValueOf<typeof Kind>;
  }

  /** NodeRef AST object. */
  export interface NodeRef extends ASTBaseNode {
    type: typeof Types.NodeRef;
    id: Literal;
    port?: Literal;
    compass?: Literal<Compass>;
  }

  /** NodeRefGroup AST object. */
  export interface NodeRefGroup extends ASTBaseParent<NodeRef> {
    type: typeof Types.NodeRefGroup;
  }

  export type EdgeTarget = NodeRef | NodeRefGroup;

  /** Edge AST object. */
  export interface Edge extends ASTBaseParent<Attribute> {
    type: typeof Types.Edge;
    targets: [from: EdgeTarget, to: EdgeTarget, ...rest: EdgeTarget[]];
  }

  /** Node AST object. */
  export interface Node extends ASTBaseParent<Attribute> {
    type: typeof Types.Node;
    id: Literal;
  }

  /** Subgraph AST object. */
  export interface Subgraph extends ASTBaseParent<ClusterStatement> {
    type: typeof Types.Subgraph;
    id?: Literal;
  }

  export type DotStatement = Graph | Comment;
  export type ClusterStatement = Attribute | Attributes | Edge | Node | Subgraph | Comment;

  export type ASTNode =
    | Attribute
    | Attributes
    | Comment
    | Dot
    | Edge
    | Graph
    | Literal
    | Node
    | NodeRef
    | NodeRefGroup
    | Subgraph;

  export type Rule =
    | typeof Types.Dot
    | typeof Types.Graph
    | typeof Types.Node
    | typeof Types.Edge
    | typeof Types.Attributes
    | typeof Types.Subgraph
    | typeof Types.Attribute
    | typeof Types.ClusterStatements;

  /**
   * Option interface for {@link parse} function.
   */
  export interface ParseOption<T extends Rule = Rule> {
    rule?: T;
  }

  /**
   * The basic usage is the same as the `parse` function,
   * except that it returns the dot language
   *
   * ```ts
   * import { AST } from '@ts-graphviz/parser';
   *
   * const ast = parse(`
   *   digraph example {
   *     node1 [
   *       label = "My Node",
   *     ]
   *   }
   * `);
   *
   * console.log(ast);
   * // {
   * //   type: 'dot',
   * //   body: [
   * //     {
   * //       type: 'graph',
   * //       id: {
   * //         type: 'literal',
   * //         value: 'example',
   * //         quoted: false,
   * //         location: {
   * //           start: { offset: 11, line: 2, column: 11 },
   * //           end: { offset: 18, line: 2, column: 18 }
   * //         }
   * //       },
   * //       directed: true,
   * //       strict: false,
   * //       body: [
   * //         {
   * //           type: 'node',
   * //           id: {
   * //             type: 'literal',
   * //             value: 'node1',
   * //             quoted: false,
   * //             location: {
   * //               start: { offset: 25, line: 3, column: 5 },
   * //               end: { offset: 30, line: 3, column: 10 }
   * //             }
   * //           },
   * //           body: [
   * //             {
   * //               type: 'attribute',
   * //               key: {
   * //                 type: 'literal',
   * //                 value: 'label',
   * //                 quoted: false,
   * //                 location: {
   * //                   start: { offset: 39, line: 4, column: 7 },
   * //                   end: { offset: 44, line: 4, column: 12 }
   * //                 }
   * //               },
   * //               value: {
   * //                 type: 'literal',
   * //                 value: 'My Node',
   * //                 quoted: true,
   * //                 location: {
   * //                   start: { offset: 47, line: 4, column: 15 },
   * //                   end: { offset: 56, line: 4, column: 24 }
   * //                 }
   * //               },
   * //               location: {
   * //                 start: { offset: 39, line: 4, column: 7 },
   * //                 end: { offset: 57, line: 4, column: 25 }
   * //               }
   * //             }
   * //           ],
   * //           location: {
   * //             start: { offset: 25, line: 3, column: 5 },
   * //             end: { offset: 63, line: 5, column: 6 }
   * //           }
   * //         }
   * //       ],
   * //       location: {
   * //         start: { offset: 3, line: 2, column: 3 },
   * //         end: { offset: 67, line: 6, column: 4 }
   * //       }
   * //     }
   * //   ],
   * //   location: {
   * //     start: { offset: 3, line: 2, column: 3 },
   * //     end: { offset: 68, line: 7, column: 1 }
   * //   }
   * // }
   * ```
   *
   * @param dot string in the dot language to be parsed.
   * @param options.rule Object type of dot string.
   * This can be "graph", "subgraph", "node", "edge",
   * "attributes", "attribute", "cluster_statements".
   *
   * @example
   * const ast = parse('test [ style=filled; ];', { rule: 'node' });
   *
   * console.log(ast);
   * // {
   * //   type: 'node',
   * //   id: {
   * //     type: 'literal',
   * //     value: 'test',
   * //     quoted: false,
   * //     location: {
   * //       start: { offset: 0, line: 1, column: 1 },
   * //       end: { offset: 4, line: 1, column: 5 }
   * //     }
   * //   },
   * //   body: [
   * //     {
   * //       type: 'attribute',
   * //       key: {
   * //         type: 'literal',
   * //         value: 'style',
   * //         quoted: false,
   * //         location: {
   * //           start: { offset: 7, line: 1, column: 8 },
   * //           end: { offset: 12, line: 1, column: 13 }
   * //         }
   * //       },
   * //       value: {
   * //         type: 'literal',
   * //         value: 'filled',
   * //         quoted: false,
   * //         location: {
   * //           start: { offset: 13, line: 1, column: 14 },
   * //           end: { offset: 19, line: 1, column: 20 }
   * //         }
   * //       },
   * //       location: {
   * //         start: { offset: 7, line: 1, column: 8 },
   * //         end: { offset: 20, line: 1, column: 21 }
   * //       }
   * //     }
   * //   ],
   * //   location: {
   * //     start: { offset: 0, line: 1, column: 1 },
   * //     end: { offset: 23, line: 1, column: 24 }
   * //   }
   * // }
   *
   * @returns The AST object of the parse result is returned.
   *
   * @throws {SyntaxError}
   */
  export function parse(dot: string): Dot;
  export function parse(dot: string, options: ParseOption<typeof Types.Edge>): Edge;
  export function parse(dot: string, options: ParseOption<typeof Types.Node>): Node;
  export function parse(dot: string, options: ParseOption<typeof Types.Graph>): Graph;
  export function parse(dot: string, options: ParseOption<typeof Types.Attribute>): Attribute;
  export function parse(dot: string, options: ParseOption<typeof Types.Attributes>): Attributes;
  export function parse(dot: string, options: ParseOption<typeof Types.Subgraph>): Subgraph;
  export function parse(dot: string, options: ParseOption<typeof Types.ClusterStatements>): ClusterStatement[];
  export function parse(dot: string, options: ParseOption<typeof Types.Dot>): Dot;
  export function parse(dot: string, options: ParseOption): Dot | Graph | ClusterStatement | ClusterStatement[];
  export function parse(dot: string, { rule }: ParseOption = {}): Dot | Graph | ClusterStatement | ClusterStatement[] {
    return _parse(dot, {
      startRule: rule,
    });
  }

  export interface StringifyOption {
    directed?: boolean;
    indentSize?: number;
  }

  export class Compiler {
    protected directed: boolean;
    protected indentSize: number;
    constructor({ directed = true, indentSize = 2 }: StringifyOption = {}) {
      this.directed = directed;
      this.indentSize = indentSize;
    }

    protected indent(line: string): string {
      return ' '.repeat(this.indentSize) + line;
    }
    protected pad(pad: string): (l: string) => string {
      return (l: string) => pad + l;
    }

    protected printAttribute(ast: AST.Attribute): string {
      return `${this.stringify(ast.key)} = ${this.stringify(ast.value)};`;
    }

    protected printAttributes(ast: AST.Attributes): string {
      return ast.body.length === 0
        ? `${ast.kind};`
        : `${ast.kind} [\n${ast.body.map(this.stringify.bind(this)).map(this.indent.bind(this)).join('\n')}\n];`;
    }

    protected printComment(ast: AST.Comment): string {
      switch (ast.kind) {
        case AST.Comment.Kind.Block:
          return '/**\n' + ast.value.split('\n').map(this.pad(' * ')).join('\n') + '\n */';
        case AST.Comment.Kind.Slash:
          return ast.value.split('\n').map(this.pad('// ')).join('\n');
        case AST.Comment.Kind.Macro:
          return ast.value.split('\n').map(this.pad('# ')).join('\n');
      }
    }
    protected printDot(ast: AST.Dot): string {
      return ast.body.map(this.stringify.bind(this)).join('\n');
    }
    protected printEdge(ast: AST.Edge): string {
      const targets = ast.targets.map(this.stringify.bind(this)).join(this.directed ? ' -> ' : ' -- ');
      return ast.body.length === 0
        ? `${targets};`
        : `${targets} [\n${ast.body.map(this.stringify.bind(this)).map(this.indent.bind(this)).join('\n')}\n];`;
    }

    protected printNode(ast: AST.Node): string {
      return ast.body.length == 0
        ? `${this.stringify(ast.id)};`
        : `${this.stringify(ast.id)} [\n${ast.body
            .map(this.stringify.bind(this))
            .map(this.indent.bind(this))
            .join('\n')}\n];`;
    }

    protected printNodeRef(ast: AST.NodeRef): string {
      return [
        this.stringify(ast.id),
        ast.port ? this.stringify(ast.port) : null,
        ast.compass ? this.stringify(ast.compass) : null,
      ]
        .filter((v) => v !== null)
        .join(':');
    }
    protected printNodeRefGroup(ast: AST.NodeRefGroup): string {
      return `{${ast.body.map(this.stringify.bind(this)).join(' ')}}`;
    }

    protected printGroup(ast: AST.Graph): string {
      return [
        ast.strict ? 'strict' : null,
        ast.directed ? 'digraph' : 'graph',
        ast.id ? this.stringify(ast.id) : null,
        ast.body.length === 0
          ? '{}'
          : `{\n${ast.body.map(this.stringify.bind(this)).map(this.indent.bind(this)).join('\n')}\n}`,
      ]
        .filter((v) => v !== null)
        .join(' ');
    }

    protected printSubgraph(ast: AST.Subgraph): string {
      return [
        'subgraph',
        ast.id ? this.stringify(ast.id) : null,
        ast.body.length === 0
          ? '{}'
          : `{\n${ast.body.map(this.stringify.bind(this)).map(this.indent.bind(this)).join('\n')}\n}`,
      ]
        .filter((v) => v !== null)
        .join(' ');
    }

    protected printLiteral(ast: AST.Literal): string {
      switch (ast.quoted) {
        case true:
          return `"${ast.value}"`;
        case false:
          return ast.value;
        case 'html':
          return `<${ast.value}>`;
      }
    }

    public stringify(ast: AST.ASTNode): string {
      switch (ast.type) {
        case AST.Types.Attribute:
          return this.printAttribute(ast);
        case AST.Types.Attributes:
          return this.printAttributes(ast);
        case AST.Types.Comment:
          return this.printComment(ast);
        case AST.Types.Dot:
          return this.printDot(ast);
        case AST.Types.Edge:
          return this.printEdge(ast);
        case AST.Types.Node:
          return this.printNode(ast);
        case AST.Types.NodeRef:
          return this.printNodeRef(ast);
        case AST.Types.NodeRefGroup:
          return this.printNodeRefGroup(ast);
        case AST.Types.Graph:
          this.directed = ast.directed;
          return this.printGroup(ast);
        case AST.Types.Subgraph:
          return this.printSubgraph(ast);
        case AST.Types.Literal:
          return this.printLiteral(ast);
      }
    }
  }

  /**
   * Stringify Graphviz AST Node.
   *
   * @param ast Graphviz AST node.
   * @returns DOT language string.
   */
  export function stringify(ast: AST.ASTNode, options?: StringifyOption): string {
    return new Compiler(options).stringify(ast);
  }
}
