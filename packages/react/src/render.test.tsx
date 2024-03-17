import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { renderToDot } from './render.js';

describe('renderToDot', () => {
  it('should render a digraph', () => {
    expect(
      renderToDot(
        <Digraph>
          <Node id="a" label="Node A" />
          <Node id="b" label={<dot:b>bold</dot:b>} />
          <Subgraph id="cluster_x" label="Cluster X">
            <Node id="c" label="Node C" />
          </Subgraph>
          <Edge targets={['a', 'b']} />
        </Digraph>,
      ),
    ).toMatchInlineSnapshot(`
      "digraph {
        "a" [
          label = "Node A";
        ];
        "b" [
          label = <<b>bold</b>>;
        ];
        subgraph "cluster_x" {
          label = "Cluster X";
          "c" [
            label = "Node C";
          ];
        }
        "a" -> "b";
      }"
    `);
  });

  it('should render a graph', () => {
    expect(
      renderToDot(
        <Graph>
          <Node id="a" label="Node A" />
          <Node id="b" label="Node B" />
          <Subgraph id="cluster_x" label="Cluster X">
            <Node id="c" label="Node C" />
          </Subgraph>
          <Edge targets={['a', 'b']} />
        </Graph>,
      ),
    ).toMatchInlineSnapshot(`
      "graph {
        "a" [
          label = "Node A";
        ];
        "b" [
          label = "Node B";
        ];
        subgraph "cluster_x" {
          label = "Cluster X";
          "c" [
            label = "Node C";
          ];
        }
        "a" -- "b";
      }"
    `);
  });
});
