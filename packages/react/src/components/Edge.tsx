import { VFC } from 'react';
import PropTypes from 'prop-types';
import { useEdge } from '../hooks/use-edge';
import { useRenderedID } from '../hooks/use-rendered-id';
import { EdgeProps } from '../types';

/**
 * `Edge` component.
 */
export const Edge: VFC<EdgeProps> = ({ targets, label, ...options }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(options, { label: renderedLabel });
  useEdge(targets, options);
  return null;
};

Edge.displayName = 'Edge';

Edge.propTypes = {
  targets: PropTypes.array.isRequired,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

Edge.defaultProps = {
  comment: undefined,
  label: undefined,
};
