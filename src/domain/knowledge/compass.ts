/**
 * Directive indicating which direction the Edge should point.
 */
export type Compass = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c' | '_';
export namespace Compass {
  /** Upper part */
  export const n: Compass = 'n';
  /** Upper left */
  export const ne: Compass = 'ne';
  /** Left part */
  export const e: Compass = 'e';
  /** Lower left */
  export const se: Compass = 'se';
  /** Lower part */
  export const s: Compass = 's';
  /** Lower right */
  export const sw: Compass = 'sw';
  /** Right part */
  export const w: Compass = 'w';
  /** Upper right */
  export const nw: Compass = 'nw';
  /** Center */
  export const c: Compass = 'c';

  /** Default */
  export const _: Compass = '_';

  const all: ReadonlyArray<string> = [n, ne, e, se, s, sw, w, nw, c, _];
  /**
   * Determine whether the character string satisfies the Compass condition.
   */
  export function is(str: string): str is Compass {
    return all.includes(str);
  }
}
