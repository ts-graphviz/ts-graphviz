import React, { FC, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Cluster as ICluster } from '@ts-graphviz/model';
import { AttributeKey } from '@ts-graphviz/dot-attribute';
import { Cluster } from './contexts/Cluster';
import { ClusterMap } from './contexts/ClusterMap';
import { useRootCluster } from '../hooks/use-root-cluster';

type Props = {
  name?: string;
};

export const ClusterPortal: FC<Props> = ({ children, name }) => {
  const root = useRootCluster();
  const map = useContext(ClusterMap);
  const cluster = useMemo(() => {
    if (name && map.has(name)) {
      return map.get(name) as ICluster<AttributeKey>;
    }
    return root;
  }, [root, map, name]);
  return <Cluster.Provider value={cluster}>{children}</Cluster.Provider>;
};

ClusterPortal.displayName = 'ClusterPortal';
ClusterPortal.defaultProps = {
  name: undefined,
};

ClusterPortal.propTypes = {
  name: PropTypes.string,
};
