import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { NodeContext } from '../contexts/NodeContext';
import { useNode, NodeProps } from '../hooks/use-node';

export const Node: FC<NodeProps> = ({ children, ...props }) => {
  const { node } = useNode(props);
  return <NodeContext.Provider value={node}>{children}</NodeContext.Provider>;
};

Node.displayName = 'Node';

Node.propTypes = {
  id: PropTypes.string.isRequired,
  comment: PropTypes.string,
};

Node.defaultProps = {
  comment: undefined,
};
