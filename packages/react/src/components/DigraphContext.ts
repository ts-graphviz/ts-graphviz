import React from 'react';
import { Digraph } from 'ts-graphviz';
export interface IDigraphContext {
  g: Digraph;
}

export const DigraphContext = React.createContext<IDigraphContext>({
  g: new Digraph(),
});
