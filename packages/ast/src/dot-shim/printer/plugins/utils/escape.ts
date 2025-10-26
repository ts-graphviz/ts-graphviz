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
export const escape = (value: string): string =>
  value
    .replace(/\0/g, '') // Remove null bytes
    .replace(/(?<!\\)"|[\r\n]/g, escapeReplacer);
// NOTE: The regular expression used to escape the string is `/(?<!\\)"|[\r\n]/g`.
// - `(?<!\\)"`: This part of the regular expression matches a double quote (`"`) **only if** it is **not preceded by a backslash**, effectively ignoring already-escaped quotes like `\"`.
// - `[\r\n]`: This part matches every carriage return (`\r`) or newline (`\n`) character in the input, regardless of whether they are escaped.

const escapeMap: Record<string, string> = {
  '\r': String.raw`\r`,
  '\n': String.raw`\n`,
  '"': String.raw`\"`,
};
function escapeReplacer(match: string) {
  return escapeMap[match];
}
