import type { FC } from 'react';
import { useNode } from '../hooks/useNode.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import type { NodeProps } from '../types.js';

/**
 * `Node` component.
 * @public
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
