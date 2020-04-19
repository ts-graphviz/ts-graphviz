import React, { FC, useMemo, useCallback, useEffect, ReactElement } from 'react';
import PropTypes from 'prop-types';
import * as gv from 'ts-graphviz';
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

const createDigraph = ({ id, comment, ...attributes }: Props): { digraph: gv.Digraph } => {
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

  const digraph = useMemo(() => {
    const g = new gv.Digraph(context, id);
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
    apply(digraph, attributes, true);
  }, [digraph, attributes]);

  useEffect(() => {
    digraph.comment = comment;
  }, [digraph, comment]);
  return { digraph };
};

export const Digraph: FC<Props> = ({ children, ...props }) => {
  const { digraph } = createDigraph(props);
  return (
    <RootClusterContext.Provider value={digraph}>
      <ClusterContext.Provider value={digraph}>{children}</ClusterContext.Provider>
    </RootClusterContext.Provider>
  );
};

Digraph.displayName = 'Digraph';

Digraph.defaultProps = {
  id: undefined,
  comment: undefined,
};

Digraph.propTypes = {
  id: PropTypes.string,
  comment: PropTypes.string,
};
