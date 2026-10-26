/**
 * Style names Graphviz knows. It writes the style raw into PostScript
 * output, names and arguments alike, so anything else would be code
 * (Graphviz 2.43).
 */
const STYLE_NAMES = new Set([
  'solid',
  'dashed',
  'dotted',
  'bold',
  'invis',
  'invisible',
  'filled',
  'rounded',
  'diagonals',
  'striped',
  'wedged',
  'radial',
  'tapered',
]);

const isBlank = (c: number) => c === 0x20 || c === 0x09; // space, tab
const isDigit = (c: number) => c >= 0x30 && c <= 0x39;
const isLetter = (c: number) =>
  (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a);

/**
 * Whether `value` is a comma-separated list of known style names and
 * `setlinewidth(n)` items, with spaces and tabs around the items and
 * inside `setlinewidth( n )`.
 *
 * A single pass over the value: each character is looked at a bounded
 * number of times, so the time is linear in the length of the value.
 *
 * @internal
 */
export function isStyleList(value: string): boolean {
  const n = value.length;
  let i = 0;
  const skipBlanks = () => {
    while (i < n && isBlank(value.charCodeAt(i))) i++;
  };
  const skipDigits = () => {
    const start = i;
    while (i < n && isDigit(value.charCodeAt(i))) i++;
    return i - start;
  };
  while (i < n) {
    skipBlanks();
    const start = i;
    while (i < n && isLetter(value.charCodeAt(i))) i++;
    if (i === start) return false;
    const word = value.slice(start, i);
    skipBlanks();
    if (word === 'setlinewidth' && value[i] === '(') {
      i++;
      skipBlanks();
      // `\d+\.?\d*` or `\.\d+`
      if (skipDigits() > 0) {
        if (value[i] === '.') {
          i++;
          skipDigits();
        }
      } else {
        if (value[i] !== '.') return false;
        i++;
        if (skipDigits() === 0) return false;
      }
      skipBlanks();
      if (value[i] !== ')') return false;
      i++;
      skipBlanks();
    } else if (!STYLE_NAMES.has(word.toLowerCase())) {
      return false;
    }
    if (i === n) return true;
    if (value[i] !== ',') return false;
    i++;
  }
  return true;
}
