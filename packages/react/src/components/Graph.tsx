import React, { FC, useMemo } from 'react';
import PropTypes from 'prop-types';
import gv from 'ts-graphviz';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';

type Props = {
  id?: string;
};

export const Graph: FC<Props> = ({ children, id }) => {
  const context = useGraphvizContext();
  const g = useMemo(() => new gv.Graph(context, id), [context, id]);
  return (
    <RootClusterContext.Provider value={g}>
      <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Graph.displayName = 'Graph';

Graph.defaultProps = {
  id: undefined,
};

Graph.propTypes = {
  id: PropTypes.string,
};
