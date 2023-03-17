import { ASTType } from '../../../common/models.js';
import { ASTNode, ASTNodeOf } from '../../types.js';

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
 * @alpha
 */
export interface SerializeOptions {
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

export const EOL = Symbol();

export type DocPart = string | typeof EOL;

/**
 * PrintContext interface provides an interface for printing an ASTNode with a set of options.
 * @group Convert AST to DOT
 * @alpha
 */
export interface SerializerContext {
  /**
   * Indicates if the AST should be printed in a directed graph.
   */
  directed: boolean;
  serializeChildren(children: ASTNode[]): Generator<DocPart>;
  /**
   * A function to print an ASTNode, taking in an ASTNode as an argument. Returns a string.
   */
  serialize(ast: ASTNode): Generator<DocPart>;
}

/**
 * SerializerPlugin is an interface for plugins used for printing an {@link ASTNode}.
 * @template T T extends {@link ASTNode}
 * @group Convert AST to DOT
 * @alpha
 */
export interface SerializerFunction<T extends ASTNode = ASTNode> {
  /**
   * Prints an ASTNode
   * @param context {@link SerializerContext} object
   * @param ast an ASTNode
   * @returns printed string
   * @memberof SerializerPlugin
   */
  (this: SerializerContext, ast: T): Generator<DocPart>;
}

export type SerializerMapping = {
  [T in ASTType]: SerializerFunction<ASTNodeOf<T>>;
};
