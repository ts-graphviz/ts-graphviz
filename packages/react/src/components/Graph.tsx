import React, { FC, useMemo, ReactElement, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import gv from 'ts-graphviz';
import { RootClusterContext } from '../contexts/RootClusterContext';
import { ClusterContext } from '../contexts/ClusterContext';
import { useGraphvizContext } from '../hooks/useContext';
import { renderId } from '../utils/renderId';

type ReactRootClusterAttributes = Omit<gv.RootClusterAttributes, 'label'> & {
  label?: ReactElement | string;
};

type Props = {
  id?: string;
  comment?: string;
} & ReactRootClusterAttributes;

const createGraph = ({ id, comment, ...attributes }: Props): { graph: gv.Graph } => {
  const context = useGraphvizContext();
  const apply = useCallback((g: gv.IRootCluster, a: ReactRootClusterAttributes, clear = false) => {
    if (clear) {
      g.clear();
    }
    const { label, ...attrs } = a;
    if (label) {
      Object.assign(attrs, { label: renderId(label) });
    }
    g.apply(attrs);
  }, []);

  const graph = useMemo(() => {
    const g = new gv.Graph(context, id);
    g.comment = comment;
    apply(g, attributes);
    return g;
  }, [context, id, comment, attributes]);
  useEffect(() => {
    return (): void => {
      context.root = undefined;
    };
  }, [context]);

  useEffect(() => {
    apply(graph, attributes, true);
  }, [graph, attributes]);

  useEffect(() => {
    graph.comment = comment;
  }, [graph, comment]);
  return { graph };
};

export const Graph: FC<Props> = ({ children, ...props }) => {
  const { graph } = createGraph(props);
  return (
    <RootClusterContext.Provider value={graph}>
      <ClusterContext.Provider value={graph}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Graph.displayName = 'Graph';

Graph.defaultProps = {
  id: undefined,
  comment: undefined,
};

Graph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
};
