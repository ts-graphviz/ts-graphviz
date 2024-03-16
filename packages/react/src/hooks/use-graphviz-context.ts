import { useContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';
import { GraphvizContext } from '../contexts/GraphvizContext.js';
import { NoGraphvizContextErrorMessage } from '../errors.js';

export interface IContext {
  container?: GraphBaseModel;
}

export function useGraphvizContext(): IContext {
  const context = useContext(GraphvizContext);
  if (context === null) {
    throw Error(NoGraphvizContextErrorMessage);
  }
  return context;
}
