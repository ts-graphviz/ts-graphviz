/**
 * Escape a string for literal value in DOT language.
 *
 * @remarks
 * The following characters are escaped:
 * - `\r` -> String.raw`\r`
 * - `\n` -> String.raw`\n`
 * - `"` -> String.raw`\"`
 *
 * But escaped characters are not escaped again.
 *
 * @param value - The string to escape
 * @returns The escaped string
 */
export const escape = (value: string): string =>
  value.replace(/(?<!\\)"|[\r\n]/g, escapeReplacer);
// NOTE: The regular expression used to escape the string is `/(?<!\\)"|[\r\n]/g`.
// - `(?<!\\)"`: This part of the regular expression matches a double quote (`"`) **only if** it is **not preceded by a backslash**, effectively ignoring already-escaped quotes like `\"`.
// - `[\r\n]`: This part matches every carriage return (`\r`) or newline (`\n`) character in the input, regardless of whether they are escaped.
function escapeReplacer(match: string) {
  switch (match) {
    case '\r':
      return '\\r';
    case '\n':
      return '\\n';
    default: // case '"':
      return '\\"';
  }
}
