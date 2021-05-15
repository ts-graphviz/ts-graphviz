import React, { FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RootCluster } from '../contexts/RootCluster';
import { Cluster } from '../contexts/Cluster';
import { useGraph } from '../hooks/use-graph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useRootCluster } from '../hooks/use-root-cluster';
import { DuplicatedRootClusterErrorMessage } from '../errors';
import { useClusterMap } from '../hooks/use-cluster-map';
import { RootClusterComponentProps } from '../types';

export const Graph: FC<RootClusterComponentProps> = ({ children, label, ...props }) => {
  const root = useRootCluster();
  if (root !== null) {
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
