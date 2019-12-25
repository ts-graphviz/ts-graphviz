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
export function concatWords(...lines: (string | undefined)[]): string {
  return lines.filter(l => typeof l === 'string').join(' ');
}

/**
 * @hidden
 */
export function joinLines(...lines: (string | undefined)[]): string {
  return lines.filter(l => typeof l === 'string').join('\n');
}

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
