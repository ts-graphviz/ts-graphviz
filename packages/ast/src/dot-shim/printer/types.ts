import type { ASTNode } from '../../types.js';

/**
 * The IndentStyle type represents an indentation style for text. It can either be a `"space"` or a `"tab"`.
 * @group Convert AST to DOT
 */
export type IndentStyle = 'space' | 'tab';

/**
 * This type represents the EndOfLine type which is used to determine the type of line ending to be used when writing to a file.
 * @group Convert AST to DOT
 */
export type EndOfLine = 'lf' | 'crlf';

/**
 * This interface provides options for converting an abstract syntax tree (AST) to a DOT representation.
 * @group Convert AST to DOT
 */
export interface PrintOptions {
  /**
   * The style of indentation to use when printing the AST.
   *
   * @default "space"
   */
  indentStyle?: IndentStyle;
  /**
   * The size of the indentation to use when printing the AST.
   *
   * @default 2
   */
  indentSize?: number;
  /**
   * The type of line ending to use when printing the AST.
   *
   * @default lf
   */
  endOfLine?: EndOfLine;
}

/**
 * PrintContext interface provides an interface for printing an ASTNode with a set of options.
 * @group Convert AST to DOT
 */
export interface PrintContext {
  /**
   * Indicates if the AST should be printed in a directed graph.
   */
  directed: boolean;
  readonly EOL: string;
  /**
   * A function to print an ASTNode, taking in an ASTNode as an argument. Returns a string.
   */
  print(ast: ASTNode): Iterable<string>;
  printChildren(children: ASTNode[]): Iterable<string>;
  join(children: ASTNode[], separator: string): Iterable<string>;
}

/**
 * PrintPlugin is an interface for plugins used for printing an {@link ASTNode}.
 * @template T T extends {@link ASTNode}
 * @group Convert AST to DOT
 */
export interface PrintPlugin<T extends ASTNode = ASTNode> {
  /**
   * Checks if an ASTNode matches the plugin
   * @returns {boolean} true if the ASTNode matches the plugin
   */
  match(ast: ASTNode): boolean;
  /**
   * Prints an ASTNode
   * @param context PrintContext object
   * @param ast an ASTNode
   * @returns printed string
   * @memberof PrintPlugin
   */
  print(context: PrintContext, ast: T): Generator<string>;
}
