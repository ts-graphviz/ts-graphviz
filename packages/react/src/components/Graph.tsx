import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { GraphProps, useGraph } from '../hooks/use-graph';

export const Graph: FC<GraphProps> = ({ children, ...props }) => {
  const graph = useGraph(props);
  return (
    <RootClusterContext.Provider value={graph}>
      <ClusterContext.Provider value={graph}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Graph.displayName = 'Graph';

Graph.defaultProps = {
  id: undefined,
  comment: undefined,
};

Graph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
};
