import { HasComment } from '@ts-graphviz/model';
import { useEffect } from 'react';

export function useHasComment(target: HasComment, comment?: string): void {
  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    target.comment = comment;
  }, [target, comment]);
}
