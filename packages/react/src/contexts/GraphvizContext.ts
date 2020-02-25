import React from 'react';
import { Context } from 'ts-graphviz';

export const GraphvizContext = React.createContext<Context>(new Context());
