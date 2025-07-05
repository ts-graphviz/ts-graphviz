import { useContext } from 'react';
import { ModelCollectorContext } from '../contexts/ModelCollector.js';

export function useModelCollector() {
  return useContext(ModelCollectorContext);
}
