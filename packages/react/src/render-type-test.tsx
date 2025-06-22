/**
 * Type tests for render function type inference
 * This file verifies that the render function correctly infers types for different model types.
 * It uses TypeScript's type assertion system to verify the types at compile time.
 * 
 * NOTE: This is a compile-time only test file. The functions are not meant to be executed.
 * All variables starting with underscore are intentionally unused - they exist only
 * to verify type assertions at compile time.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ReactElement } from 'react';
import type { RootGraphModel, SubgraphModel, GraphBaseModel } from 'ts-graphviz';
import { Digraph } from './components/Digraph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { render, type RenderResult } from './render.js';

// Helper type to assert that two types are equal
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

// Type assertion helper
type Assert<T extends true> = T;

// Test 1: Rendering a Digraph component returns RenderResult<RootGraphModel>
async function testDigraphRendering() {
  const digraphElement: ReactElement = <Digraph id="test" />;
  const result = await render(digraphElement);
  
  // Type assertion: result should be RenderResult<RootGraphModel>
  type Test1 = Assert<Equal<typeof result, RenderResult<RootGraphModel>>>;
  const _test1: Test1 = true;
  
  // The model property should be RootGraphModel
  type Test2 = Assert<Equal<typeof result.model, RootGraphModel>>;
  const _test2: Test2 = true;
}

// Test 2: Rendering a Node component with container returns the container type
async function testNodeRenderingWithContainer() {
  // Mock container (in real usage this would be an actual GraphBaseModel instance)
  const mockContainer = {} as RootGraphModel;
  
  const nodeElement: ReactElement = <Node id="node1" />;
  const result = await render(nodeElement, { container: mockContainer });
  
  // Type assertion: when rendering with a container, the result type should match the container
  type Test1 = Assert<Equal<typeof result, RenderResult<RootGraphModel>>>;
  const _test1: Test1 = true;
  
  // The model property should be RootGraphModel (matching the container)
  type Test2 = Assert<Equal<typeof result.model, RootGraphModel>>;
  const _test2: Test2 = true;
}

// Test 3: Rendering a Subgraph component returns RenderResult<SubgraphModel>
async function testSubgraphRendering() {
  const subgraphElement: ReactElement = <Subgraph id="cluster_1" />;
  const result = await render<SubgraphModel>(subgraphElement);
  
  // Type assertion: result should be RenderResult<SubgraphModel>
  type Test1 = Assert<Equal<typeof result, RenderResult<SubgraphModel>>>;
  const _test1: Test1 = true;
  
  // The model property should be SubgraphModel
  type Test2 = Assert<Equal<typeof result.model, SubgraphModel>>;
  const _test2: Test2 = true;
}

// Test 4: Verify generic type parameter inference
async function testGenericTypeInference() {
  // When no generic is specified, it defaults to RootGraphModel
  const result1 = await render(<Digraph />);
  type Test1 = Assert<Equal<typeof result1, RenderResult<RootGraphModel>>>;
  const _test1: Test1 = true;
  
  // When generic is specified, it uses that type
  const result2 = await render<SubgraphModel>(<Subgraph />);
  type Test2 = Assert<Equal<typeof result2, RenderResult<SubgraphModel>>>;
  const _test2: Test2 = true;
  
  // Container type parameter also works
  const mockContainer = {} as SubgraphModel;
  const result3 = await render<RootGraphModel, SubgraphModel>(
    <Node id="test" />,
    { container: mockContainer }
  );
  type Test3 = Assert<Equal<typeof result3, RenderResult<RootGraphModel>>>;
  const _test3: Test3 = true;
}

// Test 5: Verify RenderResult interface structure
async function testRenderResultStructure() {
  const result = await render(<Digraph />);
  
  // RenderResult should have a model property
  const model: RootGraphModel = result.model;
  
  // RenderResult should have an optional cleanup function
  const cleanup: (() => void) | undefined = result.cleanup;
  
  // Type assertions to ensure the structure is correct
  type TestModel = Assert<Equal<typeof model, RootGraphModel>>;
  const _testModel: TestModel = true;
  
  type TestCleanup = Assert<Equal<typeof cleanup, (() => void) | undefined>>;
  const _testCleanup: TestCleanup = true;
}

// Test 6: Complex nested rendering scenario
async function testComplexNestedRendering() {
  const complexElement: ReactElement = (
    <Digraph id="main">
      <Subgraph id="cluster_1">
        <Node id="a" />
        <Node id="b" />
      </Subgraph>
      <Node id="c" />
    </Digraph>
  );
  
  const result = await render(complexElement);
  
  // The result should still be RenderResult<RootGraphModel> for the top-level Digraph
  type Test1 = Assert<Equal<typeof result, RenderResult<RootGraphModel>>>;
  const _test1: Test1 = true;
  
  // The model should be RootGraphModel
  type Test2 = Assert<Equal<typeof result.model, RootGraphModel>>;
  const _test2: Test2 = true;
}

// Test 7: Container type constraints
async function testContainerTypeConstraints() {
  // Container must extend GraphBaseModel
  const validContainer = {} as GraphBaseModel;
  const subgraphContainer = {} as SubgraphModel;
  const rootContainer = {} as RootGraphModel;
  
  // All these should be valid
  const result1 = await render(<Node id="test" />, { container: validContainer });
  const result2 = await render(<Node id="test" />, { container: subgraphContainer });
  const result3 = await render(<Node id="test" />, { container: rootContainer });
  
  // Type assertions
  type Test1 = Assert<Equal<typeof result1, RenderResult<RootGraphModel>>>;
  const _test1: Test1 = true;
  
  type Test2 = Assert<Equal<typeof result2, RenderResult<RootGraphModel>>>;
  const _test2: Test2 = true;
  
  type Test3 = Assert<Equal<typeof result3, RenderResult<RootGraphModel>>>;
  const _test3: Test3 = true;
}

// Export empty object to make this a module and avoid global scope pollution
// This file is for compile-time type checking only - functions are not meant to be executed
export {};