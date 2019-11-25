import React from 'react';
import { Digraph, Graph, Subgraph } from 'ts-graphviz';

export const ClusterContext = React.createContext<Graph | Digraph | Subgraph>(new Digraph());
