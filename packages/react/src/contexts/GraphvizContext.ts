import React from 'react';
import { IContext } from '../types';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const GraphvizContext = React.createContext<IContext>(null!);
GraphvizContext.displayName = 'GraphvizContext';
