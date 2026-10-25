import * as tsGraphviz from 'ts-graphviz';
import * as tsGraphvizAst from 'ts-graphviz/ast';
import type { ModuleMap } from './evaluate';

/** The modules Playground scripts can import: the ts-graphviz this site documents. */
export const PLAYGROUND_MODULES: ModuleMap = {
  'ts-graphviz': tsGraphviz,
  'ts-graphviz/ast': tsGraphvizAst,
};
