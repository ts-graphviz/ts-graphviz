import { map, pipe } from '@ts-graphviz/common';
import type { EndOfLine, IndentStyle } from '../../types.js';

const EOL = /\r?\n/;

export function joinBy(sep: string): (value: string[]) => string {
  return (value: string[]) => value.join(sep);
}

export function wrapWith(wrapper: string): (value: string) => string {
  return (value: string) => wrapper + value + wrapper;
}

export function wrapByPair(l: string, r: string): (value: string) => string {
  return (value: string) => l + value + r;
}

export function leftPadWith(left: string): (value: string) => string {
  return (value: string) => left + value;
}

export function rightPadWith(right: string): (value: string) => string {
  return (value: string) => value + right;
}

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

export const splitByLine = (value: string): string[] => value.split(EOL);

export const align = (padding: string, eol: string) =>
  pipe(splitByLine, map(leftPadWith(padding)), joinBy(eol));

export const indent = (style: IndentStyle, size: number, eol: string) =>
  pipe(
    splitByLine,
    map(leftPadWith(style === 'space' ? ' '.repeat(size) : '\n')),
    joinBy(eol),
  );

export const endOfLine = (eol: EndOfLine) => {
  switch (eol) {
    case 'crlf':
      return '\r\n';
    case 'lf':
      return '\n';
  }
};
