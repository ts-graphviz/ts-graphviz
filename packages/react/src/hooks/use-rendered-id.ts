import { ReactElement, isValidElement, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function useRenderedID(id?: ReactElement | string): string | undefined {
  return useMemo(() => {
    if (typeof id === 'string') {
      return id;
    }
    if (isValidElement(id)) {
      const htmlLike = renderToStaticMarkup(id)
        .replace(/<dot-port>(.+?)<\/dot-port>/gi, '<$1>')
        .replace(/<dot-/gi, '<')
        .replace(/<\/dot-/gi, '</');
      return `<${htmlLike}>`;
    }
    return undefined;
  }, [id]);
}
