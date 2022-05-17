import { useEffect, useMemo } from 'react';
import { INode, NodeAttributes } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { useHasComment } from './use-comment';
import { useHasAttributes } from './use-has-attributes';

export type NodeProps = {
  id: string;
  comment?: string;
} & NodeAttributes;

export function useNode({ id, comment, ...attributes }: NodeProps): INode {
  const cluster = useCluster();
  const node = useMemo(() => {
    const n = cluster.createNode(id);
    n.attributes.apply(attributes);
    n.comment = comment;
    return n;
  }, [cluster, id, attributes, comment]);
  useHasComment(node, comment);
  useHasAttributes(node, attributes);
  useEffect(
    () => (): void => {
      cluster.removeNode(node);
    },
    [cluster, node],
  );
  return node;
}
