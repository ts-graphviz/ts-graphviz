"use strict";
exports.__esModule = true;
exports.DuplicatedRootClusterErrorMessage = exports.NoClusterErrorMessage = exports.NoGraphvizContextErrorMessage = exports.EdgeTargetLengthErrorMessage = void 0;
exports.EdgeTargetLengthErrorMessage = 'Edges must have at least 2 targets.';
exports.NoGraphvizContextErrorMessage = 'Cannot call useGraphvizContext outside GraphvizContext.\nBasically, you need to use the render function provided by @ts-graphviz/react.';
exports.NoClusterErrorMessage = 'useCluster must be called within a cluster such as Digraph, Graph, Subgraph.';
exports.DuplicatedRootClusterErrorMessage = 'RootCluster is duplicated.\nUse only one of Digraph and Graph.';
