import PropTypes from 'prop-types';
import { FC, useEffect } from 'react';
import { ContainerCluster } from '../contexts/ContainerCluster.js';
import { CurrentCluster } from '../contexts/CurrentCluster.js';
import { DuplicatedRootClusterErrorMessage } from '../errors.js';
import { useClusterMap } from '../hooks/use-cluster-map.js';
import { useContainerCluster } from '../hooks/use-container-cluster.js';
import { useGraph } from '../hooks/use-graph.js';
import { useRenderedID } from '../hooks/use-rendered-id.js';
import { RootClusterProps } from '../types.js';
/**
 * `Graph` component.
 */
export const Graph: FC<RootClusterProps> = ({
  children,
  label,
  ...options
}) => {
  const container = useContainerCluster();
  if (container !== null) {
    throw Error(DuplicatedRootClusterErrorMessage);
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const graph = useGraph(options);
  const clusters = useClusterMap();
  useEffect(() => {
    if (graph.id !== undefined) {
      clusters.set(graph.id, graph);
    }
  }, [clusters, graph]);
  return (
    <ContainerCluster.Provider value={graph}>
      <CurrentCluster.Provider value={graph}>
        {children}
      </CurrentCluster.Provider>
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
