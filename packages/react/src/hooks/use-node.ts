import { useEffect, useMemo, useCallback } from 'react';
import { INode } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { renderId } from '../utils/renderId';
import { ReactNodeAttributes } from '../types/attributes';

export type NodeProps = {
  id: string;
  comment?: string;
} & ReactNodeAttributes;

export const useNode = ({ id, comment, ...attributes }: NodeProps): { node: INode } => {
  const cluster = useCluster();
  const apply = useCallback((n: INode, a: ReactNodeAttributes, clear = false) => {
    if (clear) {
      n.attributes.clear();
    }
    const { label, ...attrs } = a;
    if (label) {
      Object.assign(attrs, { label: renderId(label) });
    }
    n.attributes.apply(attrs);
  }, []);
  const node = useMemo(() => {
    const n = cluster.createNode(id);
    apply(n, attributes);
    n.comment = comment;
    return n;
  }, [cluster, id, apply, attributes, comment]);
  useEffect(() => {
    apply(node, attributes, true);
  }, [node, attributes, apply]);

  useEffect(() => {
    node.comment = comment;
  }, [node, comment]);
  useEffect(() => {
    return (): void => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return {
    node,
  };
};
