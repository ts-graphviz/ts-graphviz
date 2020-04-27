import { IHasComment } from 'ts-graphviz';
import { useEffect } from 'react';

export const useHasComment = (target: IHasComment, comment?: string): void =>
  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    target.comment = comment;
  }, [target, comment]);
