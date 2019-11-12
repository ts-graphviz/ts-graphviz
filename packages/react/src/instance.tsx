import React, { FunctionComponent } from 'react';
import { Graphviz } from './components/Graphviz';
import { GraphvizContext } from './components/GraphvizContext';

export const instance: FunctionComponent = ({ children }) => {
  return (
    <GraphvizContext.Provider value={{}}>
      <Graphviz>{children}</Graphviz>;
    </GraphvizContext.Provider>
  );
};
