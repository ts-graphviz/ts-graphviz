import React, { FC, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { NodeAttributes } from 'ts-graphviz';
import { NodeContext } from '../contexts/NodeContext';
import { useCluster } from '../hooks/useCluster';

type Props = {
  id: string;
  comment?: string;
} & NodeAttributes;

export const Node: FC<Props> = ({ children, id, comment, ...attributes }) => {
  const cluster = useCluster();
  const node = useMemo(() => cluster.createNode(id), [cluster, id]);
  useEffect(() => {
    node.attributes.clear();
    node.attributes.apply(attributes);
  }, [node, attributes]);

  useEffect(() => {
    node.comment = comment;
  }, [node, comment]);
  useEffect(() => {
    return (): void => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
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
