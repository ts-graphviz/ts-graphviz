import type { FC } from 'react';
import { useImperativeHandle } from 'react';
import { useEdge } from '../hooks/useEdge.js';
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

  // Handle ref as prop (React 19 pattern)
  useImperativeHandle(ref, () => edge, [edge]);

  return null;
};

Edge.displayName = 'Edge';
