import { sanitize } from '@ts-graphviz/ast';
import type { CommonOptions } from './types.js';

/**
 * The DOT text to give the command: the source checked and reprinted by
 * `sanitize`, or the source itself when `options.sanitize` is `false`.
 */
export function sourceToRender(
  dot: string,
  options: Pick<CommonOptions, 'sanitize'>,
): string {
  const { sanitize: check = true } = options;
  if (check === false) return dot;
  return sanitize(dot, check === true ? undefined : check);
}
