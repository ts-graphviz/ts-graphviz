import PropTypes from 'prop-types';
import { FC } from 'react';
import { useEdge } from '../hooks/use-edge.js';
import { useRenderedID } from '../hooks/use-rendered-id.js';
import { EdgeProps } from '../types.js';

/**
 * `Edge` component.
 */
export const Edge: FC<EdgeProps> = ({ targets, label, ...options }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  useEdge(targets, options);
  return null;
};

Edge.displayName = 'Edge';
