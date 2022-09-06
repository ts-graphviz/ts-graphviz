import { map, pipe } from '../../../../common/index.js';
import { EndOfLine, IndentStyle } from '../../types.js';

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

export const escape = (value: string): string => value.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\"');

export const splitByLine = (value: string): string[] => value.split(EOL);

export const align = (padding: string, eol: string) => pipe(splitByLine, map(leftPadWith(padding)), joinBy(eol));

export const indent = (style: IndentStyle, size: number, eol: string) =>
  pipe(splitByLine, map(leftPadWith(style === 'space' ? ' '.repeat(size) : '\n')), joinBy(eol));

export const endOfLine = (eol: EndOfLine) => {
  switch (eol) {
    case 'crlf':
      return '\r\n';
    case 'lf':
      return '\n';
  }
};
