import React from 'react';
import gv from 'ts-graphviz';

export const NodeContext = React.createContext<gv.Node | null>(null);
