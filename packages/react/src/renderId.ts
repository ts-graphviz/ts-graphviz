import type { HTMLLikeValue } from '@ts-graphviz/common';
import { isValidElement, type ReactElement } from 'react';
import { renderHTMLLike } from './renderHTMLLike.js';

/**
 * Render a label-like prop: a React element becomes an HTML-like label, a
 * string is used as literal text.
 */
export function renderId<T>(
  id?: ReactElement<T> | string,
): string | HTMLLikeValue | undefined {
  if (isValidElement(id)) {
    return renderHTMLLike(id);
  }
  return id;
}
