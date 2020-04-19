import { useContext } from 'react';
import { Context } from 'ts-graphviz';
import { GraphvizContext } from '../components/contexts/GraphvizContext';

export const useGraphvizContext = (): Context => useContext(GraphvizContext);
