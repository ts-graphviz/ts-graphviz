import React from 'react';
import gv from 'ts-graphviz';

export const NodeContext = React.createContext<gv.INode>({} as gv.INode);
NodeContext.displayName = 'NodeContext';
