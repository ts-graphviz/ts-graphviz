import React, { FC, useMemo } from 'react';
import * as gv from 'ts-graphviz';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';

export const Digraph: FC = ({ children }) => {
  const context = useGraphvizContext();
  const g = useMemo(() => new gv.Digraph(context), [context]);
  return <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>;
};
