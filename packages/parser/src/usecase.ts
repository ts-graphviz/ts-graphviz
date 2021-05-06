import { RootCluster } from 'ts-graphviz';
import { Parser } from './parser';

/** @hidden */
const parser = new Parser();

/**
 * Parse a character string written in dot language and convert it to a model.
 *
 * @param dot string written in the dot language.
 *
 * @example
 *
 * ```ts
 * const G = parse(`
 * digraph hoge {
 *   a -> b;
 * }`);
 * console.log(toDot(G));
 * ```
 */
export const parse: (dot: string) => RootCluster = parser.parse.bind(parser);

export const dot: (template: TemplateStringsArray, ...substitutions: unknown[]) => RootCluster = parser.dot.bind(
  parser,
);
