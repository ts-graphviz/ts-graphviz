import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { useDigraph, DigraphProps } from '../hooks/use-digraph';

export const Digraph: FC<DigraphProps> = ({ children, ...props }) => {
  const digraph = useDigraph(props);
  return (
    <RootClusterContext.Provider value={digraph}>
      <ClusterContext.Provider value={digraph}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Digraph.displayName = 'Digraph';

Digraph.defaultProps = {
  id: undefined,
  comment: undefined,
};

Digraph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
};
