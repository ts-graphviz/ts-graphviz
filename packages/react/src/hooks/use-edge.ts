import { useEffect, useMemo, useCallback } from 'react';
import { EdgeTargetLike, IEdge } from 'ts-graphviz';
import { useCluster } from './use-cluster';
import { renderId } from '../utils/renderId';
import { ReactEdgeAttributes } from '../types/attributes';

export type EdgeProps = {
  targets: EdgeTargetLike[];
  comment?: string;
} & ReactEdgeAttributes;

export const useEdge = ({ targets, comment, ...attributes }: EdgeProps): { edge: IEdge } => {
  const cluster = useCluster();
  const apply = useCallback((e: IEdge, a: ReactEdgeAttributes, clear = false) => {
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
