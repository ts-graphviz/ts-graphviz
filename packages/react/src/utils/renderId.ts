import { ReactElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export function renderId(id?: ReactElement | string): string | undefined {
  if (typeof id === 'string') {
    return id;
  }
  if (isValidElement(id)) {
    return `<${renderToStaticMarkup(id)}>`;
  }
  return undefined;
}
