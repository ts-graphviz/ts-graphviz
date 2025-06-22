import type { FC } from 'react';
import { useImperativeHandle, useLayoutEffect } from 'react';
import { useEdge } from '../hooks/useEdge.js';
import { useGraphvizContext } from '../hooks/useGraphvizContext.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import type { EdgeProps } from '../types.js';

/**
 * `Edge` component.
 */
export const Edge: FC<EdgeProps> = ({ targets, label, ref, ...options }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });

  const edge = useEdge(targets, options);
  const context = useGraphvizContext();

  // Handle ref as prop
  useImperativeHandle(ref, () => edge, [edge]);

  // Collect model for render result
  useLayoutEffect(() => {
    context.__collectModel?.(edge);
  }, [context, edge]);

  return null;
};

Edge.displayName = 'Edge';
