import React, { FC, useMemo } from 'react';
import gv from 'ts-graphviz';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';

export const Graph: FC = ({ children }) => {
  const context = useGraphvizContext();
  const g = useMemo(() => new gv.Graph(context), [context]);
  return (
    <RootClusterContext.Provider value={g}>
      <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Graph.displayName = 'Graph';
