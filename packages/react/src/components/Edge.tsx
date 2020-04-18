import React, { FC, useEffect, useMemo, ReactElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { EdgeAttributes, EdgeTargetLike } from 'ts-graphviz';
import { renderToStaticMarkup } from 'react-dom/server';
import { useCluster } from '../hooks/useCluster';

type ReactEdgeAttributes = Omit<EdgeAttributes, 'label'> & {
  label?: ReactElement | string;
};

function renderId(id?: ReactElement | string): string | undefined {
  if (typeof id === 'string') {
    return id;
  }
  if (isValidElement(id)) {
    return renderToStaticMarkup(id);
  }
  return undefined;
}

type Props = {
  targets: EdgeTargetLike[];
  comment?: string;
} & ReactEdgeAttributes;

export const Edge: FC<Props> = ({ children, targets, comment, ...attributes }) => {
  const cluster = useCluster();
  const edge = useMemo(() => cluster.createEdge(...targets), [cluster, targets]);
  useEffect(() => {
    const { label, ...rest } = attributes;
    edge.attributes.clear();
    edge.attributes.apply({ label: renderId(label), ...rest });
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
