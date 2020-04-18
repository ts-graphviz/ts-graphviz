import React, { FC, useEffect, useMemo, ReactElement } from 'react';
import PropTypes from 'prop-types';
import gv from 'ts-graphviz';
import { NodeContext } from '../contexts/NodeContext';
import { useCluster } from '../hooks/useCluster';
import { renderId } from '../utils/renderId';

type ReactNodeAttributes = Omit<gv.NodeAttributes, 'label'> & {
  label?: ReactElement | string;
};

type Props = {
  id: string;
  comment?: string;
} & ReactNodeAttributes;

function applyAttributes(node: gv.INode, attributes: ReactNodeAttributes, clear = false): void {
  if (clear) {
    node.attributes.clear();
  }
  const { label, ...attrs } = attributes;
  if (label) {
    Object.assign(attrs, { label: renderId(label) });
  }
  node.attributes.apply(attrs);
}

export const Node: FC<Props> = ({ children, id, comment, ...attributes }) => {
  const cluster = useCluster();
  const node = useMemo(() => {
    const n = cluster.createNode(id);
    applyAttributes(n, attributes);
    n.comment = comment;
    return n;
  }, [cluster, id, comment, attributes]);
  useEffect(() => {
    applyAttributes(node, attributes, true);
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
