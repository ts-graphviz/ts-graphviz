import type { FC } from 'react';
import { useImperativeHandle, useLayoutEffect } from 'react';
import { useModelCollector } from '../hooks/useModelCollector.js';
import { useNode } from '../hooks/useNode.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import type { NodeProps } from '../types.js';

/**
 * `Node` component.
 */
export const Node: FC<NodeProps> = ({ id, label, xlabel, ref, ...options }) => {
  const renderedLabel = useRenderedID(label);
  const renderedXlabel = useRenderedID(xlabel);

  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  if (renderedXlabel !== undefined)
    Object.assign(options, { xlabel: renderedXlabel });

  const node = useNode(id, options);
  const modelCollector = useModelCollector();

  // Handle ref as prop
  useImperativeHandle(ref, () => node, [node]);

  // Collect model for render result
  useLayoutEffect(() => {
    modelCollector?.collectModel(node);
  }, [modelCollector, node]);

  return null;
};

Node.displayName = 'Node';
