import { useContext } from 'react';
import { GraphvizContext } from '../contexts/GraphvizContext';
import { IContext } from '../types';
import { NoGraphvizContextErrorMessage } from '../errors';

export function useGraphvizContext(): IContext {
  const context = useContext(GraphvizContext);
  if (context === null) {
    throw Error(NoGraphvizContextErrorMessage);
  }
  return context;
}
