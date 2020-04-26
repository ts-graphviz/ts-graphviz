import React from 'react';
import { Context } from 'ts-graphviz';

export const NoContext = {} as Context;

export const GraphvizContext = React.createContext<Context>(NoContext);
GraphvizContext.displayName = 'GraphvizContext';
