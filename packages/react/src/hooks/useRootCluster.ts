import { useContext } from 'react';
import { GraphvizContext } from '../contexts/GraphvizContext';
export function useGraphviz() {
  return useContext(GraphvizContext);
}
