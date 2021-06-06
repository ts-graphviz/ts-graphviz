import { Edge, Node, RootCluster, Subgraph } from 'ts-graphviz';
import { convert } from './convert';
import { AST } from './ast';

export type Rule = 'graph' | 'node' | 'edge' | 'subgraph';

export type ParseOption<T extends Rule = Rule> = AST.ParseOption<T>;

/**
 * Parse string written in dot language and convert it to a model.
 *
 * @remarks
 * The returned values are [ts-graphviz](https://github.com/ts-graphviz/ts-graphviz) models
 * such as `Digraph`, `Graph`, `Node`, `Edge`, `Subgraph`.
 *
 * ```ts
 * import { parse } from '@ts-graphviz/parser';
 *
 * const G = parse(`
 * digraph hoge {
 *   a -> b;
 * }`);
 * ```
 *
 * This is equivalent to the code below when using ts-graphviz.
 *
 * ```ts
 * import { digraph } from 'ts-graphviz';
 *
 * const G = digraph('hoge', (g) => {
 *   g.edge(['a', 'b']);
 * });
 * ```
 *
 * If the given string is invalid, a SyntaxError exception will be thrown.
 *
 * ```ts
 * import { parse, SyntaxError } from '@ts-graphviz/parser';
 *
 * try {
 *   parse(`invalid`);
 * } catch (e) {
 *   if (e instanceof SyntaxError) {
 *     console.log(e.message);
 *   }
 * }
 * ```
 *
 * @param dot string written in the dot language.
 * @param options.rule Object type of dot string.
 * This can be "graph", "subgraph", "node", "edge".
 *
 * @example
 * ```
 * import { Node } from 'ts-graphviz';
 * import { parse } from '@ts-graphviz/parser';
 *
 * const node = parse(
 *   `test [
 *     style=filled;
 *     color=lightgrey;
 *     label = "example #1";
 *   ];`,
 *   { rule: 'node' },
 * );
 *
 * console.log(node instanceof Node);
 * // true
 * ```
 * @throws {SyntaxError}
 */
export function parse(dot: string): RootCluster;
export function parse(dot: string, options?: ParseOption<'graph'>): RootCluster;
export function parse(dot: string, options?: ParseOption<'edge'>): Edge;
export function parse(dot: string, options?: ParseOption<'node'>): Node;
export function parse(dot: string, options?: ParseOption<'subgraph'>): Subgraph;
export function parse(dot: string, options?: ParseOption): RootCluster | Subgraph | Node | Edge {
  const ast = AST.parse(dot, { rule: options?.rule });
  if (Array.isArray(ast) || ast.type === AST.Types.Attribute || ast.type === AST.Types.Attributes) {
    throw new Error();
  }
  return convert(ast);
}
