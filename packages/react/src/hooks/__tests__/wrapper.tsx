import type { ComponentProps, ReactNode } from 'react';

import { Digraph } from '../../components/Digraph.js';
import { Graph } from '../../components/Graph.js';
import { Subgraph } from '../../components/Subgraph.js';
import { GraphContainer } from '../../contexts/GraphContainer.js';
import { GraphMap } from '../../contexts/GraphMap.js';
import { GraphvizContext } from '../../contexts/GraphvizContext.js';
import { ModelCollectorContext } from '../../contexts/ModelCollector.js';

export const context =
  () =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <ModelCollectorContext.Provider value={{ collectModel: () => {} }}>
          <GraphMap.Provider value={new Map()}>
            <GraphContainer.Provider value={null}>
              {children}
            </GraphContainer.Provider>
          </GraphMap.Provider>
        </ModelCollectorContext.Provider>
      </GraphvizContext.Provider>
    );
  };

export const digraph =
  (props: ComponentProps<typeof Digraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <ModelCollectorContext.Provider value={{ collectModel: () => {} }}>
          <GraphMap.Provider value={new Map()}>
            <GraphContainer.Provider value={null}>
              <Digraph {...props}>{children}</Digraph>
            </GraphContainer.Provider>
          </GraphMap.Provider>
        </ModelCollectorContext.Provider>
      </GraphvizContext.Provider>
    );
  };

export const digraphInSubgraph =
  (props: ComponentProps<typeof Subgraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <ModelCollectorContext.Provider value={{ collectModel: () => {} }}>
          <GraphMap.Provider value={new Map()}>
            <GraphContainer.Provider value={null}>
              <Digraph>
                <Subgraph {...props}>{children}</Subgraph>
              </Digraph>
            </GraphContainer.Provider>
          </GraphMap.Provider>
        </ModelCollectorContext.Provider>
      </GraphvizContext.Provider>
    );
  };

export const graph =
  (props: ComponentProps<typeof Graph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <ModelCollectorContext.Provider value={{ collectModel: () => {} }}>
          <GraphMap.Provider value={new Map()}>
            <GraphContainer.Provider value={null}>
              <Graph {...props}>{children}</Graph>
            </GraphContainer.Provider>
          </GraphMap.Provider>
        </ModelCollectorContext.Provider>
      </GraphvizContext.Provider>
    );
  };

export const graphInSubgraph =
  (props: ComponentProps<typeof Subgraph> = {}) =>
  ({ children }: { children: ReactNode }) => {
    return (
      <GraphvizContext.Provider value={{}}>
        <ModelCollectorContext.Provider value={{ collectModel: () => {} }}>
          <GraphMap.Provider value={new Map()}>
            <GraphContainer.Provider value={null}>
              <Graph>
                <Subgraph {...props}>{children}</Subgraph>
              </Graph>
            </GraphContainer.Provider>
          </GraphMap.Provider>
        </ModelCollectorContext.Provider>
      </GraphvizContext.Provider>
    );
  };
