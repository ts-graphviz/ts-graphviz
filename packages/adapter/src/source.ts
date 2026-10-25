import { sanitize } from '@ts-graphviz/ast';
import { escapeValue } from './create-command-args.js';
import type { CommonOptions } from './types.js';

type Attributes = NonNullable<CommonOptions['attributes']>;

/**
 * The `-G` / `-N` / `-E` arguments of `options.attributes` as a DOT source,
 * so `sanitize` checks them like the graph: Graphviz splits each argument
 * at its first `=` (a key `image=x` sets `image`), and an argument without
 * one sets the attribute to `true`.
 */
function attributesSource(attributes: Attributes): string {
  const quote = (text: string) => `"${text.replaceAll('"', '\\"')}"`;
  const list = (kind: string, record: object | undefined) => {
    if (record === undefined) return '';
    const items = Object.entries(record).map(([key, value]) => {
      const arg = `${key}${escapeValue(value)}`;
      const at = arg.indexOf('=');
      return at === -1
        ? `${quote(arg)}=true`
        : `${quote(arg.slice(0, at))}=${quote(arg.slice(at + 1))}`;
    });
    return `${kind} [${items.join(' ')}];`;
  };
  return `digraph { ${list('graph', attributes.graph)} ${list('node', attributes.node)} ${list('edge', attributes.edge)} }`;
}

/**
 * The DOT text to give the command: the source checked and reprinted by
 * `sanitize` for the output format, or the source itself when
 * `options.sanitize` is `false`. `options.attributes`, which reach the
 * command as arguments, are checked by the same rules.
 */
export function sourceToRender(
  dot: string,
  options: Pick<CommonOptions, 'sanitize' | 'format' | 'attributes'>,
): string {
  const { sanitize: check = true, format = 'svg', attributes } = options;
  if (check === false) return dot;
  const sanitizeOptions = { ...(check === true ? {} : check), format };
  if (attributes !== undefined) {
    sanitize(attributesSource(attributes), sanitizeOptions);
  }
  return sanitize(dot, sanitizeOptions);
}
