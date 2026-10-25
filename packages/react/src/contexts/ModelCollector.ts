import { type Context, createContext } from 'react';
import type { AnyDotObjectModel } from 'ts-graphviz';

export interface ModelCollectorContext {
  collectModel: (model: AnyDotObjectModel) => void;
}

export const ModelCollectorContext: Context<ModelCollectorContext | null> =
  createContext<ModelCollectorContext | null>(null);
ModelCollectorContext.displayName = 'ModelCollectorContext';
