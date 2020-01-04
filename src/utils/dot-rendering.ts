/**
 * @hidden
 */
export function escape(str: string): string {
  return str.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

/**
 * @hidden
 */
export function quote(src: string): string {
  return `"${src}"`;
}

/**
 * @hidden
 */
<<<<<<< HEAD
function concatWordsFactory(deciliter: string): (...lines: (string | undefined)[]) => string {
  return (...lines: (string | undefined)[]) => lines.filter(l => typeof l === 'string').join(deciliter);
=======
export function concatWords(...words: (string | undefined)[]): string {
  return words.filter(w => typeof w === 'string').join(' ');
>>>>>>> 483ab5260897fa7fd94eed235dd09989e0f40146
}

/**
 * @hidden
 */
export const concatWordsWithSpace = concatWordsFactory(' ');

/**
 * @hidden
 */
export const concatWordsWithColon = concatWordsFactory(':');

/**
 * @hidden
 */
export const joinLines = concatWordsFactory('\n');

/**
 * @hidden
 */
export function indent(src: string, depth: number = 1): string {
  const space = ' '.repeat(2 * depth);
  return src
    .split('\n')
    .map(l => `${space}${l}`)
    .join('\n');
}

/**
 * @hidden
 */
export function commentOut(src: string): string {
  return src
    .split('\n')
    .map(l => `// ${l}`.trim())
    .join('\n');
}
