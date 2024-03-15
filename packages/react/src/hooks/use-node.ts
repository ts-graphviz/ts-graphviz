import { useEffect, useMemo } from 'react';
import { NodeModel } from 'ts-graphviz';
import { NodeOptions } from '../types.js';
import { useHasComment } from './use-comment.js';
import { useCurrentCluster } from './use-current-cluster.js';
import { useHasAttributes } from './use-has-attributes.js';

/**
 * `useNode` is a hook that creates an instance of Node
 * according to the object given by props.
 */
export function useNode(id: string, options: NodeOptions = {}): NodeModel {
  const { comment, ...attributes } = options;
  const cluster = useCurrentCluster();
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
