import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Converts a React element into a custom HTML-like string representation.
 *
 * If no {@link label} is provided, returns the string '<>'. Otherwise, renders the React element to static markup, transforms any `dot:`-prefixed tags by removing the prefix, and wraps the result in angle brackets.
 *
 * @param label - Optional React element to render.
 * @returns A string representing the transformed HTML-like markup.
 */
export function renderHTMLLike(label?: ReactElement): string {
  return !label
    ? '<>'
    : `<${renderToStaticMarkup(label)
        .replace(/<dot:port>(.+?)<\/dot:port>/gi, '<$1>')
        .replace(/<(\/?)dot:([a-z-]+)/gi, (_, $1, $2) => `<${$1}${$2}`)}>`;
}
