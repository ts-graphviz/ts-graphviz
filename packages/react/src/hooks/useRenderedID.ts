import type { HTMLLikeValue } from '@ts-graphviz/common';
import { type ReactElement, useMemo } from 'react';
import { renderId } from '../renderId.js';

export function useRenderedID(
  id?: ReactElement | string,
): string | HTMLLikeValue | undefined {
  return useMemo(() => renderId(id), [id]);
}
