import React, { FC, ReactElement, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RootCluster, NoRootCluster } from './contexts/RootCluster';
import { Cluster } from './contexts/Cluster';
import { useDigraph, DigraphProps } from '../hooks/use-digraph';
import { useRenderedID } from '../hooks/use-rendered-id';
import { useRootCluster } from '../hooks/use-root-cluster';
import { DuplicatedRootClusterErrorMessage } from '../utils/errors';
import { useClusterMap } from '../hooks/use-cluster-map';

type Props = Omit<DigraphProps, 'label'> & {
  label?: ReactElement | string;
};

export const Digraph: FC<Props> = ({ children, label, ...props }) => {
  const root = useRootCluster();
  if (root !== NoRootCluster) {
    throw Error(DuplicatedRootClusterErrorMessage);
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  const digraph = useDigraph(props);
  const clusters = useClusterMap();
  useEffect(() => {
    if (digraph.id !== undefined) {
      clusters.set(digraph.id, digraph);
    }
  }, [clusters, digraph]);
  return (
    <RootCluster.Provider value={digraph}>
      <Cluster.Provider value={digraph}>{children}</Cluster.Provider>
    </RootCluster.Provider>
  );
};

Digraph.displayName = 'Digraph';

Digraph.defaultProps = {
  id: undefined,
  comment: undefined,
  label: undefined,
};

Digraph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};
