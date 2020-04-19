import React, { FC, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { ClusterContext } from './contexts/ClusterContext';
import { useSubgraph, SubgraphProps } from '../hooks/use-subgraph';
import { useRenderedID } from '../hooks/use-rendered-id';

type Props = Omit<SubgraphProps, 'label'> & {
  label?: ReactElement | string;
};

export const Subgraph: FC<Props> = ({ children, label, ...props }) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined) Object.assign(props, { label: renderedLabel });
  const subgraph = useSubgraph(props);
  return <ClusterContext.Provider value={subgraph}>{children}</ClusterContext.Provider>;
};

Subgraph.displayName = 'Subgraph';

Subgraph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

Subgraph.defaultProps = {
  id: undefined,
  comment: undefined,
  label: undefined,
};
