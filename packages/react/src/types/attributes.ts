import { ReactElement } from 'react';
import gv from 'ts-graphviz';

export type ReactEdgeAttributes = Omit<gv.EdgeAttributes, 'label'> & {
  label?: ReactElement | string;
};

export type ReactNodeAttributes = Omit<gv.NodeAttributes, 'label'> & {
  label?: ReactElement | string;
};

export type ReactRootClusterAttributes = Omit<gv.RootClusterAttributes, 'label'> & {
  label?: ReactElement | string;
};
