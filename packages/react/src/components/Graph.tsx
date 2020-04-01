import React, { FC, useMemo } from 'react';
import gv from 'ts-graphviz';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';

export const Graph: FC = ({ children }) => {
  const context = useGraphvizContext();
  const g = useMemo(() => new gv.Graph(context), [context]);
  return <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>;
};
