import { useLayoutEffect } from 'react';
import type { HasComment } from 'ts-graphviz';

export function useHasComment(target: HasComment, comment?: string): void {
  useLayoutEffect(() => {
    target.comment = comment;
  }, [target, comment]);
}
