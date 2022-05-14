import React, { FC, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { useNode, NodeProps } from '../hooks/use-node';
import { useRenderedID } from '../hooks/use-rendered-id';

type Props = Omit<NodeProps, 'label' | 'xlabel'> & {
  label?: ReactElement | string;
  xlabel?: ReactElement | string;
};

export const Node: FC<Props> = ({ children, label, xlabel, ...props }) => {
  const renderedLabel = useRenderedID(label);
  const renderedXlabel = useRenderedID(xlabel);

  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  if (renderedXlabel !== undefined) Object.assign(props, { xlabel: renderedXlabel });
  useNode(props);
  // TODO
  // eslint-disable-next-line react/jsx-no-useless-fragment
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
