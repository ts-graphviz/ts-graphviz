/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { FC, ComponentProps } from 'react';
import { Context } from 'ts-graphviz';
import { Digraph } from '../../../components/Digraph';
import { Graph } from '../../../components/Graph';
import { GraphvizContext } from '../../../components/contexts/GraphvizContext';
import { Subgraph } from '../../../components/Subgraph';

export const context = (): FC => ({ children }) => {
  const ctx = new Context();
  return <GraphvizContext.Provider value={ctx}>{children}</GraphvizContext.Provider>;
};

export const digraph = (props: ComponentProps<typeof Digraph> = {}): FC => ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Digraph {...props}>{children}</Digraph>
    </GraphvizContext.Provider>
  );
};

export const digraphInSubgraph = (props: ComponentProps<typeof Subgraph> = {}): FC => ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Digraph>
        <Subgraph {...props}>{children}</Subgraph>
      </Digraph>
    </GraphvizContext.Provider>
  );
};

export const graph = (props: ComponentProps<typeof Graph> = {}): FC => ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Graph {...props}>{children}</Graph>
    </GraphvizContext.Provider>
  );
};

export const graphInSubgraph = (props: ComponentProps<typeof Subgraph> = {}): FC => ({ children }) => {
  const ctx = new Context();
  return (
    <GraphvizContext.Provider value={ctx}>
      <Graph>
        <Subgraph {...props}>{children}</Subgraph>
      </Graph>
    </GraphvizContext.Provider>
  );
};
