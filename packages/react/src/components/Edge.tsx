import React, { FC, useEffect, useMemo, useCallback, ReactElement } from 'react';
import PropTypes from 'prop-types';
import gv from 'ts-graphviz';
import { useCluster } from '../hooks/useCluster';
import { renderId } from '../utils/renderId';

type ReactEdgeAttributes = Omit<gv.EdgeAttributes, 'label'> & {
  label?: ReactElement | string;
};

type Props = {
  targets: gv.EdgeTargetLike[];
  comment?: string;
} & ReactEdgeAttributes;

const createEdge = ({ targets, comment, ...attributes }: Props): { edge: gv.IEdge } => {
  const cluster = useCluster();
  const apply = useCallback((e: gv.IEdge, a: ReactEdgeAttributes, clear = false) => {
    if (clear) {
      e.attributes.clear();
    }
    const { label, ...attrs } = a;
    if (label) {
      Object.assign(attrs, { label: renderId(label) });
    }
    e.attributes.apply(attrs);
  }, []);
  const edge = useMemo(() => {
    const e = cluster.createEdge(...targets);
    e.comment = comment;
    apply(e, attributes);
    return e;
  }, [cluster, targets, comment, attributes]);
  useEffect(() => {
    apply(edge, attributes, true);
  }, [edge, attributes]);

  useEffect(() => {
    edge.comment = comment;
  }, [edge, comment]);

  useEffect(() => {
    return (): void => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
  return {
    edge,
  };
};
export const Edge: FC<Props> = ({ children, ...props }) => {
  createEdge(props);
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
