import React, { FC } from 'react';
import { NodeContext } from '../contexts/NodeContext';
import { useCluster } from '../hooks/useCluster';
export const Node: FC<{ id: string }> = ({ children, id }) => {
  const cluster = useCluster();
  const node = cluster?.createNode(id);
  return <NodeContext.Provider value={node}>{children}</NodeContext.Provider>;
};
