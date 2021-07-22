import { useContext } from 'react';
import { ICluster } from 'ts-graphviz';
import { GraphvizContext } from '../contexts/GraphvizContext';
import { NoGraphvizContextErrorMessage } from '../errors';

export interface IContext {
  container?: ICluster;
}

export function useGraphvizContext(): IContext {
  const context = useContext(GraphvizContext);
  if (context === null) {
    throw Error(NoGraphvizContextErrorMessage);
  }
  return context;
}
