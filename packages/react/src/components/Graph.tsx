import React, { FC, ReactElement, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RootCluster, NoRootCluster } from './contexts/RootCluster';
import { Cluster } from './contexts/Cluster';
import { GraphProps, useGraph } from '../hooks/use-graph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useRootCluster } from '../hooks/use-root-cluster';
import { DuplicatedRootClusterErrorMessage } from '../utils/errors';
import { useClusterMap } from '../hooks/use-cluster-map';

type Props = Omit<GraphProps, 'label'> & {
  label?: ReactElement | string;
};

export const Graph: FC<Props> = ({ children, label, ...props }) => {
  const root = useRootCluster();
  if (root !== NoRootCluster) {
    throw Error(DuplicatedRootClusterErrorMessage);
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  const graph = useGraph(props);
  const clusters = useClusterMap();
  useEffect(() => {
    if (graph.id !== undefined) {
      clusters.set(graph.id, graph);
    }
  }, [clusters, graph]);
  return (
    <RootCluster.Provider value={graph}>
      <Cluster.Provider value={graph}>{children}</Cluster.Provider>
    </RootCluster.Provider>
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
