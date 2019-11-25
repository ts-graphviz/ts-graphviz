import React, { FC } from 'react';
import gv from 'ts-graphviz';
import { ClusterContext } from '../contexts/ClusterContext';
import { GraphvizContext } from '../contexts/GraphvizContext';

export const Graph: FC = ({ children }) => {
  const g = new gv.Graph();
  return (
    <GraphvizContext.Provider value={g}>
      <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>
    </GraphvizContext.Provider>
  );
};
