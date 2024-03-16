import { ReactElement, isValidElement } from 'react';
import { renderHTMLLike } from './render-htmllike.js';

export function renderId<T>(id?: ReactElement<T> | string): string | undefined {
  if (isValidElement(id)) {
    return renderHTMLLike(id);
  }
  return id;
}
