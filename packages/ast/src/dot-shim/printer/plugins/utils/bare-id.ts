/**
 * An identifier as Graphviz reads one: letters, `_`, digits (not first) and
 * any character beyond ASCII (Graphviz reads every byte >= 0x80 as a letter).
 * `$`, which the parser accepts, is a syntax error to Graphviz.
 */
const IDENTIFIER = /^[A-Za-z_\u0080-￿][A-Za-z0-9_\u0080-￿]*$/;
/** DOT numerals: `[-]?(.[0-9]+ | [0-9]+(.[0-9]*)?)`. */
const NUMERAL = /^-?(\.[0-9]+|[0-9]+(\.[0-9]*)?)$/;
/** Keywords of the DOT language, in any case; as an id, one must be quoted. */
const KEYWORD = /^(strict|graph|digraph|subgraph|node|edge)$/i;

/**
 * Whether a value can be written without quotes: one identifier that is not
 * a keyword, or one numeral, so that Graphviz and the parser both read it
 * back as that one ID. A numeral followed by letters (`1abc`) is two tokens
 * to Graphviz.
 */
export function isBareId(value: string): boolean {
  return (
    (IDENTIFIER.test(value) && !KEYWORD.test(value)) || NUMERAL.test(value)
  );
}
