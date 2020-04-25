import React, { FC } from 'react';
import { Context } from 'ts-graphviz';
import { Digraph } from '../../../components/Digraph';
import { Graph } from '../../../components/Graph';
import { GraphvizContext } from '../../../components/contexts/GraphvizContext';
import { Subgraph } from '../../../components/Subgraph';

export const context: FC = ({ children }) => {
  const ctx = new Context();
  return <GraphvizContext.Provider value={ctx}>{children}</GraphvizContext.Provider>;
};

export const digraph: FC = ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Digraph>{children}</Digraph>
    </GraphvizContext.Provider>
  );
};

export const digraphInSubgraph: FC = ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Digraph>
        <Subgraph>{children}</Subgraph>
      </Digraph>
    </GraphvizContext.Provider>
  );
};

export const graph: FC = ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Graph>{children}</Graph>
    </GraphvizContext.Provider>
  );
};

export const graphInSubgraph: FC = ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Graph>
        <Subgraph>{children}</Subgraph>
      </Graph>
    </GraphvizContext.Provider>
  );
};
