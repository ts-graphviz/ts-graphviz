import { type Context, createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export const GraphMap: Context<Map<string, AnyGraphContainer> | null> =
  createContext<Map<string, AnyGraphContainer> | null>(null);
GraphMap.displayName = 'GraphMap';
