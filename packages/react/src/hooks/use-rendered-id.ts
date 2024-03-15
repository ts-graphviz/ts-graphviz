import { ReactElement, useMemo } from 'react';
import { renderId } from '../render-id.js';

export function useRenderedID(id?: ReactElement | string): string | undefined {
  return useMemo(() => renderId(id), [id]);
}
