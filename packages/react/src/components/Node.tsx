import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { INode, NodeAttributes } from 'ts-graphviz';
import { NodeContext } from '../contexts/NodeContext';
import { useCluster } from '../hooks/useCluster';

type Props = {
  id: string;
  comment?: string;
} & NodeAttributes;

export const Node = forwardRef<INode, Props>(({ children, id, comment, ...attributes }, ref) => {
  const cluster = useCluster();
  const node = useMemo(() => cluster.createNode(id), [cluster, id]);
  useImperativeHandle(ref, () => node, [node]);
  useEffect(() => {
    node.attributes.clear();
    node.attributes.apply(attributes);
  }, [node, attributes]);

  useEffect(() => {
    node.comment = comment;
  }, [node, comment]);
  useEffect(() => {
    return () => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return <NodeContext.Provider value={node}>{children}</NodeContext.Provider>;
});

Node.displayName = 'Node';
