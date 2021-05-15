import { useEffect, useMemo } from 'react';
import { INode } from 'ts-graphviz';
import { NodeProps } from '../types';
import { useCluster } from './use-cluster';
import { useHasComment } from './use-comment';
import { useHasAttributes } from './use-has-attributes';

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
  useEffect(() => {
    return (): void => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return node;
}
