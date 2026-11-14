import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { createRoot } from '../createRoot.js';
import { expectGraph, expectGraphStructure } from '../test-utils/assertions.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';
import '../types.js';
import { elementToDot, render } from '../test-utils/render.js';

describe('Graph Component', () => {
  describe('Basic Rendering', () => {
    it('renders empty undirected graph', async () => {
      const dot = await elementToDot(<Graph id="empty" />);
      expect(dot).toMatchInlineSnapshot(`
        "graph "empty" {}"
      `);
    });

    it('renders undirected graph with nodes', async () => {
      const dot = await elementToDot(
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
      const dot = await elementToDot(
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
      const dot = await elementToDot(
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
      const dot = await elementToDot(
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
      const dot = await elementToDot(
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
        elementToDot(
          <Graph>
            <Graph />
          </Graph>,
        ),
      ).rejects.toThrow('RootCluster is duplicated');
    });

    it('renders several root Graphs as one document', async () => {
      await expect(
        elementToDot(
          <>
            <Graph id="first" />
            <Graph id="second" />
          </>,
        ),
      ).resolves.toBe('graph "first" {}\ngraph "second" {}');
    });
  });

  describe('React Integration', () => {
    it('provides access to GraphBaseModel via createRef', async () => {
      const graphRef = createRef<GraphBaseModel>();

      const root = createRoot();
      await render(
        root,
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
      // Assigned in a callback, which TypeScript does not see.
      let graphModel = null as GraphBaseModel | null;

      const root = createRoot();
      await render(
        root,
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
