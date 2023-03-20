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
