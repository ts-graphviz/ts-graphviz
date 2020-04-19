import { useContext } from 'react';
import { Context } from 'ts-graphviz';
import { GraphvizContext } from '../contexts/GraphvizContext';

export function useGraphvizContext(): Context {
  return useContext(GraphvizContext);
}
