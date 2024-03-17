import { type ReactElement, isValidElement } from 'react';
import { renderHTMLLike } from './renderHTMLLike.js';

export function renderId<T>(id?: ReactElement<T> | string): string | undefined {
  if (isValidElement(id)) {
    return renderHTMLLike(id);
  }
  return id;
}
