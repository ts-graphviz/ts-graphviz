import { FC } from 'react';
import { useNode } from '../hooks/use-node.js';
import { useRenderedID } from '../hooks/use-rendered-id.js';
import { NodeProps } from '../types.js';

/**
 * `Node` component.
 */
export const Node: FC<NodeProps> = ({ id, label, xlabel, ...options }) => {
  const renderedLabel = useRenderedID(label);
  const renderedXlabel = useRenderedID(xlabel);

  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  if (renderedXlabel !== undefined)
    Object.assign(options, { xlabel: renderedXlabel });
  useNode(id, options);
  return null;
};

Node.displayName = 'Node';
