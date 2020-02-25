import React, { FC } from 'react';
import * as gv from 'ts-graphviz';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';

export const Digraph: FC = ({ children }) => {
  const context = useGraphvizContext();
  const g = new gv.Digraph(context);
  return <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>;
};
