import type { FC } from 'react';
import { useImperativeHandle, useLayoutEffect } from 'react';
import { useEdge } from '../hooks/useEdge.js';
import { useModelCollector } from '../hooks/useModelCollector.js';
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
  const modelCollector = useModelCollector();

  // Handle ref as prop
  useImperativeHandle(ref, () => edge, [edge]);

  // Collect model for render result
  useLayoutEffect(() => {
    modelCollector?.collectModel(edge);
  }, [modelCollector, edge]);

  return null;
};

Edge.displayName = 'Edge';
