import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Renders a React element to an HTML-like string.
 *
 * @param label - The React element to render.
 * @returns The HTML-like string representation of the React element.
 * @public
 */
export function renderHTMLLike(label?: ReactElement): string {
  const htmlLike = renderToStaticMarkup(label)
    .replace(/<dot:port>(.+?)<\/dot:port>/gi, '<$1>')
    .replace(/<(\/?)dot:([a-z-]+)/gi, (_, $1, $2) => `<${$1}${$2}`);
  return `<${htmlLike}>`;
}
