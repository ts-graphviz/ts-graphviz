import { ReactElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function renderId(id?: ReactElement | string): string | undefined {
  if (isValidElement(id)) {
    const htmlLike = renderToStaticMarkup(id)
      .replace(/<dot-port>(.+?)<\/dot-port>/gi, '<$1>')
      .replace(
        /<(\/?)dot-([a-z-]+)/gi,
        (_, $1, $2) => `<${$1}${$2.toUpperCase()}`,
      );
    return `<${htmlLike}>`;
  }
  return id;
}
