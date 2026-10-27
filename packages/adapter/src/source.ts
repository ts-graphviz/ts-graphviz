import { sanitize } from '@ts-graphviz/ast';
import { ownOptions, withCode } from '@ts-graphviz/common';
import { attributeArgs } from './create-command-args.js';
import type { CommonOptions } from './types.js';

type Attributes = NonNullable<CommonOptions['attributes']>;

const LIST: Record<'G' | 'N' | 'E', string> = {
  G: 'graph',
  N: 'node',
  E: 'edge',
};

/**
 * The `-G` / `-N` / `-E` arguments of `options.attributes` as a DOT source,
 * so `sanitize` checks them like the graph: Graphviz splits each argument
 * at its first `=` (a key `image=x` sets `image`), and an argument without
 * one sets the attribute to `true`.
 *
 * The arguments reach Graphviz as they are, while a DOT string reads a
 * backslash before a line break as a line continuation and a backslash
 * before a quote as an escape. So an argument with a line break, or with a
 * backslash that would escape a quote of the copy (before a quote, or at
 * the end of its key or value), is rejected here on
 * its exact text rather than checked through a copy that would read
 * differently.
 */
function attributesSource(attributes: Attributes): string {
  const quote = (text: string) => `"${text.replaceAll('"', '\\"')}"`;
  const lists: Record<'G' | 'N' | 'E', string[]> = { G: [], N: [], E: [] };
  for (const [flag, arg] of attributeArgs(attributes)) {
    const at = arg.indexOf('=');
    const parts = at === -1 ? [arg] : [arg.slice(0, at), arg.slice(at + 1)];
    const problem = /[\r\n]/.test(arg)
      ? 'contains a line break'
      : // A DOT string cannot hold these as they are: the backslash would
        // escape a quote of the copy.
        parts.some((part) => /\\(?=")|\\$/.test(part))
        ? 'has a backslash before a quote or at the end of its key or value, which cannot be checked'
        : undefined;
    if (problem !== undefined) {
      throw withCode(
        new DOMException(
          `Unsafe DOT: the ${LIST[flag]} attribute argument ${JSON.stringify(arg)} ${problem}.`,
          'SecurityError',
        ),
        'TSG_ERR_UNSAFE_DOT',
      );
    }
    lists[flag].push(
      parts.length === 1
        ? `${quote(arg)}=true`
        : `${quote(parts[0])}=${quote(parts[1])}`,
    );
  }
  const list = (flag: 'G' | 'N' | 'E') =>
    lists[flag].length > 0 ? `${LIST[flag]} [${lists[flag].join(' ')}];` : '';
  return `digraph { ${list('G')} ${list('N')} ${list('E')} }`;
}

/**
 * The DOT text to give the command: the source checked and reprinted by
 * `sanitize` for the output format, or the source itself when
 * `options.sanitize` is `false`. `options.attributes`, which reach the
 * command as arguments, are checked by the same rules.
 */
export function sourceToRender(
  dot: string,
  options: Pick<CommonOptions<string>, 'sanitize' | 'format' | 'attributes'>,
): string {
  const {
    sanitize: check = true,
    format = 'svg',
    attributes,
  } = ownOptions(options);
  if (check === false) return dot;
  const sanitizeOptions = { ...(check === true ? {} : check), format };
  if (attributes !== undefined) {
    sanitize(attributesSource(attributes), sanitizeOptions);
  }
  return sanitize(dot, sanitizeOptions);
}
