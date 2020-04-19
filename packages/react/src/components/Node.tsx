import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useNode, NodeProps } from '../hooks/use-node';

export const Node: FC<NodeProps> = ({ children, ...props }) => {
  useNode(props);
  return <>{children}</>;
};

Node.displayName = 'Node';

Node.propTypes = {
  id: PropTypes.string.isRequired,
  comment: PropTypes.string,
};

Node.defaultProps = {
  comment: undefined,
};
