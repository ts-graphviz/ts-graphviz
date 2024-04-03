import type { FC } from 'react';
import { useEdge } from '../hooks/useEdge.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import type { EdgeProps } from '../types.js';

/**
 * `Edge` component.
 * @public
 */
export const Edge: FC<EdgeProps> = ({ targets, label, ...options }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  useEdge(targets, options);
  return null;
};

Edge.displayName = 'Edge';
