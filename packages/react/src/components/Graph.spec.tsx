import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { render, renderToDot } from '../render.js';
import { expectGraph, expectGraphStructure } from '../test-utils/assertions.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';
import '../types.js';

describe('Graph Component', () => {
  describe('Basic Rendering', () => {
    it('renders empty undirected graph', async () => {
      const dot = await renderToDot(<Graph id="empty" />);
      expect(dot).toMatchInlineSnapshot(`
        "graph "empty" {}"
      `);
    });

    it('renders undirected graph with nodes', async () => {
      const dot = await renderToDot(
        <Graph id="simple">
          <Node id="A" />
          <Node id="B" />
        </Graph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "graph "simple" {
          "A";
          "B";
        }"
      `);
    });

    it('renders undirected graph with nodes and edges', async () => {
      const dot = await renderToDot(
        <Graph id="connected">
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} />
        </Graph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "graph "connected" {
          "A";
          "B";
          "A" -- "B";
        }"
      `);
    });

    it('renders undirected graph with attributes', async () => {
      const dot = await renderToDot(
        <Graph id="styled" bgcolor="lightyellow" layout="neato">
          <Node id="styled_node" shape="circle" />
        </Graph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "graph "styled" {
          bgcolor = "lightyellow";
          layout = "neato";
          "styled_node" [
            shape = "circle";
          ];
        }"
      `);
    });
  });

  describe('Complex Structures', () => {
    it('renders undirected graph with subgraphs', async () => {
      const dot = await renderToDot(
        <Graph id="complex">
          <Node id="start" />
          <Subgraph id="cluster_main">
            <Node id="process" />
          </Subgraph>
          <Edge targets={['start', 'process']} />
        </Graph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "graph "complex" {
          "start";
          subgraph "cluster_main" {
            "process";
          }
          "start" -- "process";
        }"
      `);
    });

    it('renders triangle graph (cycle)', async () => {
      const dot = await renderToDot(
        <Graph id="triangle">
          <Node id="A" />
          <Node id="B" />
          <Node id="C" />
          <Edge targets={['A', 'B']} />
          <Edge targets={['B', 'C']} />
          <Edge targets={['C', 'A']} />
        </Graph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "graph "triangle" {
          "A";
          "B";
          "C";
          "A" -- "B";
          "B" -- "C";
          "C" -- "A";
        }"
      `);
    });
  });

  describe('Error Handling', () => {
    it('throws error when duplicate Graph components are nested', async () => {
      await expect(
        render(
          <Graph>
            <Graph />
          </Graph>,
        ),
      ).rejects.toThrow('No model was rendered');
    });

    it('renders multiple root Graphs as separate models', async () => {
      const result = await render(
        <>
          <Graph id="first" />
          <Graph id="second" />
        </>,
      );

      expect(result.models).toHaveLength(2);
      expect(result.models[0].id).toBe('first');
      expect(result.models[1].id).toBe('second');
    });
  });

  describe('React Integration', () => {
    it('provides access to GraphBaseModel via createRef', async () => {
      const graphRef = createRef<GraphBaseModel>();

      await render(
        <Graph id="testgraph" ref={graphRef}>
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} />
        </Graph>,
      );

      expect(graphRef.current).not.toBeNull();
      if (graphRef.current) {
        expectGraph(graphRef.current);
        expect(graphRef.current.id).toBe('testgraph');
        expectGraphStructure(graphRef.current, {
          nodeCount: 2,
          edgeCount: 1,
          directed: false,
        });
      }
    });

    it('provides access to GraphBaseModel via function ref', async () => {
      let graphModel: GraphBaseModel | null = null;

      await render(
        <Graph
          id="funcref"
          ref={(graph) => {
            graphModel = graph;
          }}
          label="Undirected Test"
        >
          <Node id="test" />
        </Graph>,
      );

      expect(graphModel).not.toBeNull();
      if (graphModel) {
        expectGraph(graphModel);
        expect(graphModel.id).toBe('funcref');
        expect(graphModel.get('label')).toBe('Undirected Test');
        expectGraphStructure(graphModel, {
          nodeCount: 1,
          directed: false,
        });
      }
    });
  });
});
