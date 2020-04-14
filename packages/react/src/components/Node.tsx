import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { INode } from 'ts-graphviz';
import { NodeContext } from '../contexts/NodeContext';
import { useCluster } from '../hooks/useCluster';

export const Node = forwardRef<INode, { id: string }>(({ children, id }, ref) => {
  const cluster = useCluster();
  const node = useMemo(() => cluster.createNode(id), [cluster, id]);
  useImperativeHandle(ref, () => node, [node]);
  useEffect(() => {
    return () => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return <NodeContext.Provider value={node}>{children}</NodeContext.Provider>;
});

Node.displayName = 'Node';
