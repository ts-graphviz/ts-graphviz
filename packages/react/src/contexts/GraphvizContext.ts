import React from 'react';
import { Digraph, Graph } from 'ts-graphviz';

export const GraphvizContext = React.createContext<Digraph | Graph>(new Digraph());
