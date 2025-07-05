import { createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export const GraphMap = createContext<Map<string, AnyGraphContainer> | null>(
  null,
);
GraphMap.displayName = 'GraphMap';
