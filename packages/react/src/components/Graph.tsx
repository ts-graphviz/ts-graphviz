import React, { FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ContainerCluster } from '../contexts/ContainerCluster';
import { CurrentCluster } from '../contexts/CurrentCluster';
import { useGraph } from '../hooks/use-graph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useContainerCluster } from '../hooks/use-container-cluster';
import { DuplicatedRootClusterErrorMessage } from '../errors';
import { useClusterMap } from '../hooks/use-cluster-map';
import { RootClusterProps } from '../types';
/**
 * `Graph` component.
 */
export const Graph: FC<RootClusterProps> = ({ children, label, ...options }) => {
  const container = useContainerCluster();
  if (container !== null) {
    throw Error(DuplicatedRootClusterErrorMessage);
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(options, { label: renderedLabel });
  const graph = useGraph(options);
  const clusters = useClusterMap();
  useEffect(() => {
    if (graph.id !== undefined) {
      clusters.set(graph.id, graph);
    }
  }, [clusters, graph]);
  return (
    <ContainerCluster.Provider value={graph}>
      <CurrentCluster.Provider value={graph}>{children}</CurrentCluster.Provider>
    </ContainerCluster.Provider>
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
