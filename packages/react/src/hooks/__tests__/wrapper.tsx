import type { ComponentProps, ReactNode } from 'react';

import { Digraph } from '../../components/Digraph.js';
import { Graph } from '../../components/Graph.js';
import { Subgraph } from '../../components/Subgraph.js';
import { GraphvizContext } from '../../contexts/GraphvizContext.js';

export const context =
  () =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>{children}</GraphvizContext.Provider>
    );
  };

export const digraph =
  (props: ComponentProps<typeof Digraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <Digraph {...props}>{children}</Digraph>
      </GraphvizContext.Provider>
    );
  };

export const digraphInSubgraph =
  (props: ComponentProps<typeof Subgraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <Digraph>
          <Subgraph {...props}>{children}</Subgraph>
        </Digraph>
      </GraphvizContext.Provider>
    );
  };

export const graph =
  (props: ComponentProps<typeof Graph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <Graph {...props}>{children}</Graph>
      </GraphvizContext.Provider>
    );
  };

export const graphInSubgraph =
  (props: ComponentProps<typeof Subgraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <Graph>
          <Subgraph {...props}>{children}</Subgraph>
        </Graph>
      </GraphvizContext.Provider>
    );
  };
