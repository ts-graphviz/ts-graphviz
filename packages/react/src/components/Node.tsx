import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { useNode } from '../hooks/use-node';
import { useRenderedID } from '../hooks/use-rendered-id';
import { NodeComponentProps } from '../types';

export const Node: FC<NodeComponentProps> = ({ children, label, xlabel, ...props }) => {
  const renderedLabel = useRenderedID(label);
  const renderedXlabel = useRenderedID(xlabel);

  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  if (renderedXlabel !== undefined) Object.assign(props, { xlabel: renderedXlabel });
  useNode(props);
  return <>{children}</>;
};

Node.displayName = 'Node';

Node.propTypes = {
  id: PropTypes.string.isRequired,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  xlabel: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

Node.defaultProps = {
  comment: undefined,
  label: undefined,
  xlabel: undefined,
};
