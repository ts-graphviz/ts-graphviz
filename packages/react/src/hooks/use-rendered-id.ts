import { ReactElement, isValidElement, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function useRenderedID(id?: ReactElement | string): string | undefined {
  return useMemo(() => {
    if (typeof id === 'string') {
      return id;
    }
    if (isValidElement(id)) {
      return `<${renderToStaticMarkup(id)}>`;
    }
    return undefined;
  }, [id]);
}
