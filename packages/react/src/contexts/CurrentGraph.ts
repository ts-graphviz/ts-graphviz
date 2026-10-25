import { type Context, createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export const CurrentGraph: Context<AnyGraphContainer | null> =
  createContext<AnyGraphContainer | null>(null);
CurrentGraph.displayName = 'CurrentGraph';
