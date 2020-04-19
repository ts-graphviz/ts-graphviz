import React, { FC, ReactElement, useMemo } from 'react';
import PropTypes from 'prop-types';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { GraphProps, useGraph } from '../hooks/use-graph';
import { renderId } from '../utils/renderId';

type Props = Omit<GraphProps, 'label'> & {
  label?: ReactElement | string;
};

export const Graph: FC<Props> = ({ children, label, ...props }) => {
  const renderedLabel = useMemo(() => renderId(label), [label]);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
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
  label: undefined,
};

Graph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};
