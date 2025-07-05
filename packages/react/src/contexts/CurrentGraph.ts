import { createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export const CurrentGraph = createContext<AnyGraphContainer | null>(null);
CurrentGraph.displayName = 'CurrentGraph';
