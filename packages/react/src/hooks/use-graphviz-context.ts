import { useContext } from 'react';
import { GraphvizContext, Context } from '../components/contexts/GraphvizContext';
import { NoGraphvizContextErrorMessage } from '../utils/errors';

export function useGraphvizContext(): Context {
  const context = useContext(GraphvizContext);
  if (context === null) {
    throw Error(NoGraphvizContextErrorMessage);
  }
  return context;
}
