import { createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export const GraphContainer = createContext<AnyGraphContainer | null>(null);
GraphContainer.displayName = 'GraphContainer';
