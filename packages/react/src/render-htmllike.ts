import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function renderHTMLLike(label?: ReactElement): string {
  const htmlLike = renderToStaticMarkup(label)
    .replace(/<dot-port>(.+?)<\/dot-port>/gi, '<$1>')
    .replace(
      /<(\/?)dot-([a-z-]+)/gi,
      (_, $1, $2) => `<${$1}${$2.toUpperCase()}`,
    );
  return `<${htmlLike}>`;
}
