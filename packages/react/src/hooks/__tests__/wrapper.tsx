import type { ComponentProps, ReactNode } from 'react';
import { createModelsContext, type ModelsContext } from 'ts-graphviz';

import { Digraph } from '../../components/Digraph.js';
import { Graph } from '../../components/Graph.js';
import { Subgraph } from '../../components/Subgraph.js';
import { GraphContainer } from '../../contexts/GraphContainer.js';
import { GraphMap } from '../../contexts/GraphMap.js';
import { GraphvizContext } from '../../contexts/GraphvizContext.js';

export const context =
  ({ models = {} }: { models?: Partial<ModelsContext> } = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{ models: createModelsContext(models) }}>
        <GraphMap.Provider value={new Map()}>
          <GraphContainer.Provider value={null}>
            {children}
          </GraphContainer.Provider>
        </GraphMap.Provider>
      </GraphvizContext.Provider>
    );
  };

export const digraph =
  (props: ComponentProps<typeof Digraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{ models: createModelsContext({}) }}>
        <GraphMap.Provider value={new Map()}>
          <GraphContainer.Provider value={null}>
            <Digraph {...props}>{children}</Digraph>
          </GraphContainer.Provider>
        </GraphMap.Provider>
      </GraphvizContext.Provider>
    );
  };

export const digraphInSubgraph =
  (props: ComponentProps<typeof Subgraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{ models: createModelsContext({}) }}>
        <GraphMap.Provider value={new Map()}>
          <GraphContainer.Provider value={null}>
            <Digraph>
              <Subgraph {...props}>{children}</Subgraph>
            </Digraph>
          </GraphContainer.Provider>
        </GraphMap.Provider>
      </GraphvizContext.Provider>
    );
  };

export const graph =
  (props: ComponentProps<typeof Graph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{ models: createModelsContext({}) }}>
        <GraphMap.Provider value={new Map()}>
          <GraphContainer.Provider value={null}>
            <Graph {...props}>{children}</Graph>
          </GraphContainer.Provider>
        </GraphMap.Provider>
      </GraphvizContext.Provider>
    );
  };

export const graphInSubgraph =
  (props: ComponentProps<typeof Subgraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{ models: createModelsContext({}) }}>
        <GraphMap.Provider value={new Map()}>
          <GraphContainer.Provider value={null}>
            <Graph>
              <Subgraph {...props}>{children}</Subgraph>
            </Graph>
          </GraphContainer.Provider>
        </GraphMap.Provider>
      </GraphvizContext.Provider>
    );
  };
