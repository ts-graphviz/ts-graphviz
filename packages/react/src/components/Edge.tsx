import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useEdge, EdgeProps } from '../hooks/use-edge';

export const Edge: FC<EdgeProps> = ({ children, ...props }) => {
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
