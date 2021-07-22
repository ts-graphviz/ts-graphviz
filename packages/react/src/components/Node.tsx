import { VFC } from 'react';
import PropTypes from 'prop-types';
import { useNode } from '../hooks/use-node';
import { useRenderedID } from '../hooks/use-rendered-id';
import { NodeProps } from '../types';

/**
 * `Node` component.
 */
export const Node: VFC<NodeProps> = ({ id, label, xlabel, ...options }) => {
  const renderedLabel = useRenderedID(label);
  const renderedXlabel = useRenderedID(xlabel);

  if (renderedLabel !== undefined) Object.assign(options, { label: renderedLabel });
  if (renderedXlabel !== undefined) Object.assign(options, { xlabel: renderedXlabel });
  useNode(id, options);
  return null;
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
