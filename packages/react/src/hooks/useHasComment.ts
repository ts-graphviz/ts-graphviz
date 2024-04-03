import { useEffect } from 'react';
import type { HasComment } from 'ts-graphviz';

/**
 * Sets the comment property of the target object whenever the comment value changes.
 * @param target - The object that has a comment property.
 * @param comment - The new comment value.
 * @public
 */
export function useHasComment(target: HasComment, comment?: string): void {
  useEffect(() => {
    target.comment = comment;
  }, [target, comment]);
}
