import { ReactElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function renderId(id?: ReactElement | string): string | undefined {
  if (typeof id === 'string') {
    return id;
  }
  if (isValidElement(id)) {
    const htmlLike = renderToStaticMarkup(id)
      .replace(/<dot-port>(.+?)<\/dot-port>/gi, '<$1>')
      .replace(/<(\/?)dot-/gi, '<$1');
    return `<${htmlLike}>`;
  }
  return undefined;
}
