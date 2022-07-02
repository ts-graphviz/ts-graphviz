import type { Compass } from './type';

/** @hidden */
export function isCompass(c: string): c is Compass {
  return ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c'].includes(c);
}
