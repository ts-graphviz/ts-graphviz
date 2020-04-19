import React, { FC, ReactElement, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useEdge, EdgeProps } from '../hooks/use-edge';
import { renderId } from '../utils/renderId';

type Props = Omit<EdgeProps, 'label'> & {
  label?: ReactElement | string;
};

export const Edge: FC<Props> = ({ children, label, ...props }) => {
  const renderedLabel = useMemo(() => renderId(label), [label]);
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
