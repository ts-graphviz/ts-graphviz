import { useEffect, useMemo } from 'react';
import { INode, NodeAttributes } from 'ts-graphviz';
import { useCluster } from './use-cluster';

export type NodeProps = {
  id: string;
  comment?: string;
} & NodeAttributes;

export const useNode = ({ id, comment, ...attributes }: NodeProps): INode => {
  const cluster = useCluster();
  const node = useMemo(() => {
    const n = cluster.createNode(id);
    n.attributes.apply(attributes);
    n.comment = comment;
    return n;
  }, [cluster, id, attributes, comment]);
  useEffect(() => {
    node.attributes.clear();
    node.attributes.apply(attributes);
  }, [node, attributes]);

  useEffect(() => {
    node.comment = comment;
  }, [node, comment]);
  useEffect(() => {
    return (): void => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return node;
};
