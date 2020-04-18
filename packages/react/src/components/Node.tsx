import React, { FC, useEffect, useMemo, ReactElement, useCallback } from 'react';
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

const createNode = ({ id, comment, ...attributes }: Props): { node: gv.INode } => {
  const cluster = useCluster();
  const apply = useCallback((n: gv.INode, a: ReactNodeAttributes, clear = false) => {
    if (clear) {
      n.attributes.clear();
    }
    const { label, ...attrs } = a;
    if (label) {
      Object.assign(attrs, { label: renderId(label) });
    }
    n.attributes.apply(attrs);
  }, []);
  const node = useMemo(() => {
    const n = cluster.createNode(id);
    apply(n, attributes);
    n.comment = comment;
    return n;
  }, [cluster, id, comment, attributes]);
  useEffect(() => {
    apply(node, attributes, true);
  }, [node, attributes]);

  useEffect(() => {
    node.comment = comment;
  }, [node, comment]);
  useEffect(() => {
    return (): void => {
      cluster.removeNode(node);
    };
  }, [cluster, node]);
  return {
    node,
  };
};
export const Node: FC<Props> = ({ children, ...props }) => {
  const { node } = createNode(props);
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
