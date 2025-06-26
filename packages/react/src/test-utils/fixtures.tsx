import { Digraph } from '../components/Digraph.js';
import { Edge } from '../components/Edge.js';
import { Graph } from '../components/Graph.js';
import { Node } from '../components/Node.js';
import { Subgraph } from '../components/Subgraph.js';

/**
 * Common test fixtures for ts-graphviz React components
 */
export const SimpleDigraph = () => (
  <Digraph id="simple">
    <Node id="a" label="Node A" />
    <Node id="b" label="Node B" />
    <Edge targets={['a', 'b']} />
  </Digraph>
);

/**
 * Complex graph with subgraphs and multiple edges
 */
export const ComplexDigraph = () => (
  <Digraph id="complex">
    <Node id="start" shape="circle" />
    <Subgraph id="cluster_main" label="Main Process">
      <Node id="process1" shape="box" />
      <Node id="process2" shape="box" />
      <Edge targets={['process1', 'process2']} />
    </Subgraph>
    <Subgraph id="cluster_sub" label="Sub Process">
      <Node id="sub1" shape="diamond" />
      <Node id="sub2" shape="diamond" />
    </Subgraph>
    <Edge targets={['start', 'process1']} />
    <Edge targets={['process2', 'sub1']} />
    <Edge targets={['sub1', 'sub2']} />
  </Digraph>
);

/**
 * Undirected graph
 */
export const SimpleGraph = () => (
  <Graph id="undirected">
    <Node id="n1" />
    <Node id="n2" />
    <Node id="n3" />
    <Edge targets={['n1', 'n2']} />
    <Edge targets={['n2', 'n3']} />
    <Edge targets={['n3', 'n1']} />
  </Graph>
);

/**
 * Graph with HTML-like labels
 */
export const HTMLLabelGraph = () => (
  <Digraph id="htmllabels">
    <Node
      id="table"
      label={
        <dot:table border={0} cellborder={1} cellspacing={0}>
          <dot:tr>
            <dot:td>Row 1</dot:td>
            <dot:td>Cell 2</dot:td>
          </dot:tr>
          <dot:tr>
            <dot:td colspan={2}>Row 2</dot:td>
          </dot:tr>
        </dot:table>
      }
    />
  </Digraph>
);

/**
 * Empty graph
 */
export const EmptyDigraph = () => <Digraph id="empty" />;

/**
 * Graph with only nodes (no edges)
 */
export const NodesOnlyDigraph = () => (
  <Digraph id="nodes-only">
    <Node id="isolated1" />
    <Node id="isolated2" />
    <Node id="isolated3" />
  </Digraph>
);

/**
 * Deeply nested subgraphs
 */
export const DeeplyNestedDigraph = () => (
  <Digraph id="deeply-nested">
    <Subgraph id="level1">
      <Subgraph id="level2">
        <Subgraph id="level3">
          <Node id="deep-node" />
        </Subgraph>
      </Subgraph>
    </Subgraph>
  </Digraph>
);
