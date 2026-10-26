/**
 * The offset of the first `{` that opens a block nested deeper than
 * `limit` (a graph's body is at depth 1), or -1 if there is none.
 *
 * Braces are counted as the parser reads the source: not inside quoted
 * strings (with `\` escapes), HTML-like strings (`<…>`, nested) or
 * comments (`/* … *\/`, and `//` or `#` to the end of the line). One pass
 * over the source, so the time is linear in its length.
 *
 * @internal
 */
export function deepBlockOffset(input: string, limit: number): number {
  const n = input.length;
  let depth = 0;
  let i = 0;
  while (i < n) {
    const c = input[i];
    if (c === '"') {
      i++;
      while (i < n && input[i] !== '"') i += input[i] === '\\' ? 2 : 1;
      i++;
    } else if (c === '<') {
      let html = 1;
      i++;
      while (i < n && html > 0) {
        if (input[i] === '<') html++;
        else if (input[i] === '>') html--;
        i++;
      }
    } else if (c === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
    } else if (c === '#' || (c === '/' && input[i + 1] === '/')) {
      // A line comment ends at LF or CR, as the grammar's newline does.
      i++;
      while (i < n && input[i] !== '\n' && input[i] !== '\r') i++;
    } else {
      if (c === '{') {
        depth++;
        if (depth > limit) return i;
      } else if (c === '}') {
        depth--;
      }
      i++;
    }
  }
  return -1;
}
