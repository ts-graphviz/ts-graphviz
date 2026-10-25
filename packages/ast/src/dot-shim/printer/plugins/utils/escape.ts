/**
 * Escape a string for literal value in DOT language.
 *
 * @remarks
 * The following transformations are applied:
 * - Null bytes (`\0`) are removed
 * - `\r` -> String.raw`\r`
 * - `\n` -> String.raw`\n`
 * - `"` -> String.raw`\"`
 *
 * Null bytes are removed because they cause parsing errors in Graphviz,
 * which treats them as string terminators.
 *
 * Already-escaped characters are not escaped again.
 *
 * @param value - The string to escape
 * @returns The escaped string
 */
export function escape(value: string): string {
  // A model can hold a non-string (an array from parsed JSON, say): escape
  // its text, never its elements.
  const text = String(value);
  let out = '';
  // Length of the run of backslashes just before the current character: a
  // quote or line break after an odd run is already escaped, after an even
  // run (`\\"`) it is not, and a trailing odd run would escape the closing
  // quote.
  let backslashes = 0;
  for (const ch of text) {
    if (ch === '\0') continue; // Remove null bytes
    if (ch === '\\') {
      backslashes++;
      out += ch;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      // A raw line break is written as its escape sequence, after closing an
      // odd backslash run that would otherwise make it a line continuation.
      if (backslashes % 2 === 1) out += '\\';
      out += ch === '\n' ? String.raw`\n` : String.raw`\r`;
    } else {
      if (ch === '"' && backslashes % 2 === 0) out += '\\';
      out += ch;
    }
    backslashes = 0;
  }
  return backslashes % 2 === 1 ? `${out}\\` : out;
}
