import { useEffect, useMemo } from 'react';
import type { NodeModel } from 'ts-graphviz';
import type { NodeOptions } from '../types.js';
import { useCurrentGraph } from './useCurrentGraph.js';
import { useHasAttributes } from './useHasAttributes.js';
import { useHasComment } from './useHasComment.js';

/**
 * `useNode` is a hook that creates an instance of Node
 * according to the object given by props.
 */
export function useNode(id: string, options: NodeOptions = {}): NodeModel {
  const { comment, ...attributes } = options;
  const cluster = useCurrentGraph();

  const node = useMemo(() => {
    const n = cluster.createNode(id);
    return n;
  }, [cluster, id]);

  useHasComment(node, comment);
  useHasAttributes(node, attributes);
  useEffect(() => {
    return (): void => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return node;
}
