export function escape(str: string): string {
  return str.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

export function wrap(word: string, wrapper: string): string {
  return `${wrapper}${word}${wrapper}`;
}

export function wrapFactory(wrapper: string): (word: string) => string {
  return (word: string): string => wrap(word, wrapper);
}

export function leftPad(word: string, pad: string): string {
  return `${pad}${word}`;
}

export function leftPadFactory(pad: string): (w?: string) => string | undefined {
  return (w?: string): string | undefined => {
    if (typeof w === 'string') {
      return leftPad(w, pad);
    }
  };
}

export const quote = wrapFactory('"');

export const spaceLeftPad = leftPadFactory(' ');

export function concatWordsFactory(deciliter: string): (...lines: (string | undefined)[]) => string {
  return (...lines: (string | undefined)[]): string => lines.filter((l) => typeof l === 'string').join(deciliter);
}

export const concatWordsWithSpace = concatWordsFactory(' ');

export const concatWordsWithColon = concatWordsFactory(':');

export const joinLines = concatWordsFactory('\n');
export const join = concatWordsFactory('');
export function joinWith(separator: string, lines: (string | undefined)[]): string {
  return lines.filter((l) => typeof l === 'string').join(separator);
}

export function indent(src: string): string {
  const space = '  ';
  return src
    .split('\n')
    .map((l) => join(space, l))
    .join('\n');
}

export function commentOut(src: string): string {
  return src
    .split('\n')
    .map((l) => join('// ', l).trim())
    .join('\n');
}
export function commentOutIfExist(src: string | undefined): string | undefined {
  return typeof src === 'string' ? commentOut(src) : undefined;
}
