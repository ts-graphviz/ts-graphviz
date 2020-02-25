import { useContext } from 'react';
import { GraphvizContext } from '../contexts/GraphvizContext';
export function useGraphvizContext() {
  return useContext(GraphvizContext);
}
