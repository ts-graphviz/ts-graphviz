import { createContext } from 'react';
import type { DotObjectModel } from 'ts-graphviz';

export interface ModelCollectorContext {
  collectModel: (model: DotObjectModel) => void;
}

export const ModelCollectorContext =
  createContext<ModelCollectorContext | null>(null);
ModelCollectorContext.displayName = 'ModelCollectorContext';
