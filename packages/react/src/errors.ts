export const EdgeTargetLengthErrorMessage = 'Edges must have at least 2 targets.';
export const NoGraphvizContextErrorMessage =
  'Cannot call useGraphvizContext outside GraphvizContext.\nBasically, you need to use the render function provided by @ts-graphviz/react.';
export const NoClusterErrorMessage = 'useCluster must be called within a cluster such as Digraph, Graph, Subgraph.';
export const DuplicatedRootClusterErrorMessage = 'RootCluster is duplicated.\nUse only one of Digraph and Graph.';

export const NoContainerErrorMessage = 'There are no clusters of container(Subgraph, Digraph, Graph).';
