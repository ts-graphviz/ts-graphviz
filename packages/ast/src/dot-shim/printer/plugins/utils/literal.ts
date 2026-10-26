/**
 * Whether markup can be written as an HTML-like string: Graphviz reads it by
 * counting `<` / `>` nesting, so an unbalanced `>` would end it early and the
 * rest would be read as DOT.
 */
export function isBalancedMarkup(markup: string): boolean {
  let depth = 0;
  for (const ch of markup) {
    if (ch === '<') depth++;
    else if (ch === '>' && --depth < 0) return false;
  }
  return depth === 0 && !markup.includes('\0');
}

const NUMERAL = '-?(?:\\.\\d+|\\d+(?:\\.\\d*)?)';
const IDENTIFIER = '[\\p{L}\\p{Nl}$_][\\p{L}\\p{Nl}\\p{Nd}$_]*';
const BARE_ID = new RegExp(
  `^(?:${IDENTIFIER}|${NUMERAL}|${NUMERAL}${IDENTIFIER})$`,
  'u',
);
/**
 * Whether a value can be written without quotes: a single identifier or
 * numeral as the parser reads one, so it cannot add tokens to the output.
 */
export function isBareId(value: string): boolean {
  return BARE_ID.test(value);
}
