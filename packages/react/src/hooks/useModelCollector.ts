import { useContext } from 'react';
import { ModelCollectorContext } from '../contexts/ModelCollector.js';

export function useModelCollector(): ModelCollectorContext | null {
  return useContext(ModelCollectorContext);
}
