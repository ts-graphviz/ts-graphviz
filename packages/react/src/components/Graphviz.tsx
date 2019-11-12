import React, { FunctionComponent } from 'react';
import { GraphvizContext } from './GraphvizContext';

export const Graphviz: FunctionComponent = ({ children }) => {
  return <GraphvizContext.Provider value={{}}>{children}</GraphvizContext.Provider>;
};
