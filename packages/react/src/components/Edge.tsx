import React, { FC, useEffect, useMemo, ReactElement } from 'react';
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

function applyAttributes(edge: gv.IEdge, attributes: ReactEdgeAttributes, clear = false): void {
  if (clear) {
    edge.attributes.clear();
  }
  const { label, ...attrs } = attributes;
  if (label) {
    Object.assign(attrs, { label: renderId(label) });
  }
  edge.attributes.apply(attrs);
}

export const Edge: FC<Props> = ({ children, targets, comment, ...attributes }) => {
  const cluster = useCluster();
  const edge = useMemo(() => {
    const e = cluster.createEdge(...targets);
    e.comment = comment;
    applyAttributes(e, attributes);
    return e;
  }, [cluster, targets, comment, attributes]);
  useEffect(() => {
    applyAttributes(edge, attributes, true);
  }, [edge, attributes]);

  useEffect(() => {
    edge.comment = comment;
  }, [edge, comment]);

  useEffect(() => {
    return (): void => {
      cluster.removeEdge(edge);
    };
  }, [cluster, edge]);
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
