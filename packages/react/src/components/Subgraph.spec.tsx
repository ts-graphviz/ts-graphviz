import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { render, renderToDot } from '../render.js';
import {
  expectGraphStructure,
  expectSubgraph,
} from '../test-utils/assertions.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';
import '../types.js';

describe('Subgraph Component', () => {
  describe('Basic Rendering', () => {
    it('renders empty subgraph in directed graph', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Subgraph id="empty" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          subgraph "empty" {}
        }"
      `);
    });

    it('renders subgraph with nodes in directed graph', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Subgraph id="simple">
            <Node id="A" />
            <Node id="B" />
          </Subgraph>
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          subgraph "simple" {
            "A";
            "B";
          }
        }"
      `);
    });

    it('renders subgraph with nodes and edges in directed graph', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Subgraph id="connected">
            <Node id="A" />
            <Node id="B" />
            <Edge targets={['A', 'B']} />
          </Subgraph>
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          subgraph "connected" {
            "A";
            "B";
            "A" -> "B";
          }
        }"
      `);
    });

    it('renders subgraph with attributes', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Subgraph id="cluster_styled" label="Cluster" bgcolor="lightgray">
            <Node id="styled_node" />
          </Subgraph>
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          subgraph "cluster_styled" {
            bgcolor = "lightgray";
            label = "Cluster";
            "styled_node";
          }
        }"
      `);
    });
  });

  describe('Undirected Graph Context', () => {
    it('renders subgraph in undirected graph', async () => {
      const dot = await renderToDot(
        <Graph>
          <Subgraph id="undirected_sub">
            <Node id="A" />
            <Node id="B" />
            <Edge targets={['A', 'B']} />
          </Subgraph>
        </Graph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "graph {
          subgraph "undirected_sub" {
            "A";
            "B";
            "A" -- "B";
          }
        }"
      `);
    });
  });

  describe('Nested Structures', () => {
    it('renders nested subgraphs', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Subgraph id="outer">
            <Node id="outer_node" />
            <Subgraph id="inner">
              <Node id="inner_node" />
            </Subgraph>
          </Subgraph>
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          subgraph "outer" {
            "outer_node";
            subgraph "inner" {
              "inner_node";
            }
          }
        }"
      `);
    });

    it('renders multiple subgraphs with cross-references', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Subgraph id="cluster_1">
            <Node id="node1" />
          </Subgraph>
          <Subgraph id="cluster_2">
            <Node id="node2" />
          </Subgraph>
          <Edge targets={['node1', 'node2']} />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          subgraph "cluster_1" {
            "node1";
          }
          subgraph "cluster_2" {
            "node2";
          }
          "node1" -> "node2";
        }"
      `);
    });
  });

  describe('React Integration', () => {
    it('provides access to GraphBaseModel via createRef', async () => {
      const subgraphRef = createRef<GraphBaseModel>();

      await render(
        <Digraph>
          <Subgraph id="testsubgraph" ref={subgraphRef}>
            <Node id="A" />
            <Node id="B" />
            <Edge targets={['A', 'B']} />
          </Subgraph>
        </Digraph>,
      );

      expect(subgraphRef.current).not.toBeNull();
      if (subgraphRef.current) {
        expectSubgraph(subgraphRef.current);
        expect(subgraphRef.current.id).toBe('testsubgraph');
        expectGraphStructure(subgraphRef.current, {
          nodeCount: 2,
          edgeCount: 1,
        });
      }
    });

    it('provides access to GraphBaseModel via function ref', async () => {
      let subgraphModel: GraphBaseModel | null = null;

      await render(
        <Digraph>
          <Subgraph
            id="funcref"
            ref={(subgraph) => {
              subgraphModel = subgraph;
            }}
            label="Function Ref Subgraph"
          >
            <Node id="test" />
          </Subgraph>
        </Digraph>,
      );

      expect(subgraphModel).not.toBeNull();
      if (subgraphModel) {
        expectSubgraph(subgraphModel);
        expect(subgraphModel.id).toBe('funcref');
        expect(subgraphModel.get('label')).toBe('Function Ref Subgraph');
        expectGraphStructure(subgraphModel, {
          nodeCount: 1,
        });
      }
    });
  });
});
