import type { FC } from 'react';
import { useImperativeHandle, useLayoutEffect } from 'react';
import { useGraphvizContext } from '../hooks/useGraphvizContext.js';
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
  const context = useGraphvizContext();

  // Handle ref as prop
  useImperativeHandle(ref, () => node, [node]);

  // Collect model for render result
  useLayoutEffect(() => {
    context.__collectModel?.(node);
  }, [context, node]);

  return null;
};

Node.displayName = 'Node';
