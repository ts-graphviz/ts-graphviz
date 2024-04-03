import { useEffect, useMemo } from 'react';
import type { NodeModel } from 'ts-graphviz';
import type { NodeOptions } from '../types.js';
import { useCurrentGraph } from './useCurrentGraph.js';
import { useHasAttributes } from './useHasAttributes.js';
import { useHasComment } from './useHasComment.js';

/**
 * Creates a node with the specified ID and options.
 *
 * @param id - The ID of the node.
 * @param options - The options for the node.
 * @returns The created node.
 * @public
 */
export function useNode(id: string, options: NodeOptions = {}): NodeModel {
  const { comment, ...attributes } = options;
  const cluster = useCurrentGraph();
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
