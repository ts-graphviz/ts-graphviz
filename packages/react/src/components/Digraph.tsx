import React, { FC, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as gv from 'ts-graphviz';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';

type Props = {
  id?: string;
};

export const Digraph: FC<Props> = ({ children, id }) => {
  const context = useGraphvizContext();
  const g = useMemo(() => new gv.Digraph(context, id), [context, id]);
  return (
    <RootClusterContext.Provider value={g}>
      <ClusterContext.Provider value={g}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Digraph.displayName = 'Digraph';

Digraph.defaultProps = {
  id: undefined,
};

Digraph.propTypes = {
  id: PropTypes.string,
};
