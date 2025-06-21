import type { FC } from 'react';
import { useImperativeHandle } from 'react';
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

  // Handle ref as prop (React 19 pattern)
  useImperativeHandle(ref, () => node, [node]);

  return null;
};

Node.displayName = 'Node';
