// CommonJS project testing ESM package import
console.log('Testing ts-graphviz import from CommonJS project...\n');

// In Node.js 20+, CJS can import ESM using dynamic import()
async function testEsmImport() {
  try {
    // Test 1: Dynamic import of main package
    console.log('Test 1: Dynamic import of ts-graphviz');
    const tsGraphviz = await import('ts-graphviz');
    console.log('✅ Successfully imported ts-graphviz');
    console.log('Available exports:', Object.keys(tsGraphviz));

    // Test 2: Use imported functionality
    console.log('\nTest 2: Creating a simple graph');
    const { Digraph, Node, Edge, toDot, attribute } = tsGraphviz;

    const graph = new Digraph('G', { comment: 'Test from CJS' });
    const nodeA = new Node('A', { [attribute.label]: 'Node A' });
    const nodeB = new Node('B', { [attribute.label]: 'Node B' });
    const edge = new Edge([nodeA, nodeB], { [attribute.color]: 'blue' });

    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addEdge(edge);

    const dot = toDot(graph);
    console.log('✅ Generated DOT:', dot);

    // Test 3: Import submodules
    console.log('\nTest 3: Dynamic import of submodules');
    const adapter = await import('ts-graphviz/adapter');
    console.log('✅ Successfully imported ts-graphviz/adapter');
    console.log('Adapter exports:', Object.keys(adapter));

    const ast = await import('ts-graphviz/ast');
    console.log('✅ Successfully imported ts-graphviz/ast');
    console.log('AST exports:', Object.keys(ast));

    // Test 4: Parse DOT string
    console.log('\nTest 4: Parsing DOT string');
    const { parse } = ast;
    const parsed = parse(dot);
    console.log('✅ Successfully parsed DOT string');

    // Test 5: Test adapter functionality
    console.log('\nTest 5: Testing adapter (write to devNull)');
    const { toFile } = adapter;
    const { devNull } = await import('node:os');
    await toFile(dot, devNull);
    console.log('✅ Successfully wrote to file');

    console.log(
      '\n🎉 All tests passed! ESM package works correctly in CJS project.',
    );
  } catch (error) {
    console.error('❌ Error importing ESM module:', error.message);
    process.exit(1);
  }
}

// Test what happens with require() - should fail for ESM-only package
console.log('Test 0: Attempting require() (expected to fail)');
try {
  require('ts-graphviz');
  // If we get here, require worked, which means the package isn't fully ESM-only yet
  console.log(
    '⚠️  Warning: require() succeeded, package may still have CJS compatibility',
  );
  console.log(
    'This is acceptable for the E2E test - the important thing is that dynamic import works',
  );
} catch (error) {
  console.log('✅ Expected error with require():', error.code || error.message);
}

// Run the async tests
testEsmImport().catch(console.error);
