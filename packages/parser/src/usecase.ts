import { RootCluster } from 'ts-graphviz';
import { convert } from './convert';
import { AST } from './ast';

/**
 * Parse string written in dot language and convert it to a model.
 *
 * @description
 * The return value is a `Graph` or `Digraph` that inherits from `RootCluster`.
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
 * @throws {SyntaxError}
 */
export function parse(dot: string): RootCluster {
  const ast = AST.parse(dot);
  return convert(ast);
}

/**
 * > This is an experimental API.
 * >
 * > Behavior may change in the future.
 *
 * A tag template version of the parse function.
 *
 * Returns a Graph or Digraph object based on the parsed result.
 *
 * If the given string is invalid, a SyntaxError exception will be thrown.
 *
 * ```ts
 * import { dot } from '@ts-graphviz/parser';
 *
 * const G = dot`
 *   graph {
 *     a -- b
 *   }
 * `;
 * ```
 */
export function dot(template: TemplateStringsArray, ...substitutions: unknown[]): RootCluster {
  const dot = String.raw(template, ...substitutions);
  return parse(dot);
}
