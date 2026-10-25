import { type Context, createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export const GraphContainer: Context<AnyGraphContainer | null> =
  createContext<AnyGraphContainer | null>(null);
GraphContainer.displayName = 'GraphContainer';
