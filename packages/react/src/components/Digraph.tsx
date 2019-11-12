import React, { FunctionComponent } from 'react';
import graphviz from 'ts-graphviz';
import { DigraphContext } from './DigraphContext';
export const Digraph: FunctionComponent = ({ children }) => {
  const g = new graphviz.Digraph();
  return <DigraphContext.Provider value={{ g }}>{children}</DigraphContext.Provider>;
};
