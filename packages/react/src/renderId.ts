import { type ReactElement, isValidElement } from 'react';
import { renderHTMLLike } from './renderHTMLLike.js';

/**
 * Renders the ID of a React element or a string.
 *
 * @param id - The React element or string to render the ID for.
 * @returns The rendered ID as a string, or undefined if the input is undefined.
 * @public
 */
export function renderId<T>(id?: ReactElement<T> | string): string | undefined {
  if (isValidElement(id)) {
    return renderHTMLLike(id);
  }
  return id;
}
