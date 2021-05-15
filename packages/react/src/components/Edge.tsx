import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useEdge } from '../hooks/use-edge';
import { useRenderedID } from '../hooks/use-rendered-id';
import { EdgeComponentProps } from '../types';

export const Edge: FC<EdgeComponentProps> = ({ children, label, ...props }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  useEdge(props);
  return <>{children}</>;
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
