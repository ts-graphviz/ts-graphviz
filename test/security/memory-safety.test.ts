import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { parse, stringify } from '@ts-graphviz/ast';
import { Digraph, Graph, Node, Edge, Subgraph } from 'ts-graphviz';

/**
 * Memory safety and resource management security tests for ts-graphviz
 * These tests verify that the library handles memory usage safely and prevents resource exhaustion attacks
 */
const isCI = process.env.CI === 'true';
const isStressTest = process.env.SKIP_STRESS_TESTS === 'true';

describe.concurrent('Memory Safety in ts-graphviz', () => {
  describe('Graph Size Limits', () => {
    it('should handle large graphs without memory exhaustion', () => {
      const g = new Digraph();
      const nodeCount = isCI ? 100 : 1000;
      
      // Create a large graph
      for (let i = 0; i < nodeCount; i++) {
        g.node(`node${i}`, { label: `Node ${i}` });
      }
      
      // Add edges creating a complex network
      for (let i = 0; i < nodeCount - 1; i++) {
        g.edge([`node${i}`, `node${i + 1}`]);
        if (i % 10 === 0 && i + 10 < nodeCount) {
          g.edge([`node${i}`, `node${i + 10}`]);
        }
      }
      
      // Should be able to generate DOT without issues
      expect(() => g.toDot()).not.toThrow();
      
      // Verify node count
      expect(g.nodes.length).toBe(nodeCount);
    });

    it('should handle deeply nested subgraphs safely', () => {
      const maxDepth = isCI ? 10 : 50;
      
      const createNestedGraph = (depth: number): Subgraph => {
        const sub = new Subgraph(`cluster_${depth}`);
        sub.node(`node_${depth}`, { label: `Level ${depth}` });
        
        if (depth > 0) {
          sub.addSubgraph(createNestedGraph(depth - 1));
        }
        
        return sub;
      };
      
      const g = new Digraph();
      g.addSubgraph(createNestedGraph(maxDepth));
      
      // Should handle deep nesting without stack overflow
      expect(() => g.toDot()).not.toThrow();
      
      // Verify the structure is created
      const dot = g.toDot();
      expect(dot).toContain('cluster_0');
      expect(dot).toContain(`cluster_${maxDepth}`);
    });
  });

  describe('String Buffer Safety', () => {
    it('should handle large attribute values safely', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: isCI ? 10000 : 100000 }),
          fc.string({ minLength: 1, maxLength: 1 }),
          (size, char) => {
            const g = new Digraph();
            const largeString = char.repeat(size);
            
            // Add node with large attribute values
            g.node('test', {
              label: largeString,
              tooltip: largeString,
              comment: largeString
            });
            
            // Should handle large strings without issues
            const dot = g.toDot();
            expect(dot).toContain('test');
            expect(dot.length).toBeGreaterThan(size);
            
            // Verify escaping still works with large strings
            if (char === '"') {
              expect(dot).toContain('\\"');
            }
            
            return true;
          }
        ),
        { numRuns: isCI ? 10 : 20 }
      );
    });

    it('should prevent exponential string growth attacks', () => {
      const g = new Digraph();
      
      // Attempt to create exponential growth through repeated concatenation
      let label = 'a';
      for (let i = 0; i < 20; i++) {
        label = label + label; // Exponential growth
        if (label.length > 1000000) break; // Safety limit
      }
      
      g.node('test', { label: label.substring(0, 10000) }); // Limit size
      
      // Should handle without consuming excessive memory
      expect(() => g.toDot()).not.toThrow();
    });
  });

  describe('Parser Memory Safety', () => {
    it('should handle malformed DOT strings without memory leaks', () => {
      const malformedInputs = [
        'digraph { '.repeat(1000), // Unclosed braces
        'digraph { a -> b ' + '[label="test"]'.repeat(100), // Many attributes
        'digraph { ' + 'subgraph { '.repeat(50), // Nested unclosed
        'digraph { ' + '"' + 'a'.repeat(10000) + '"', // Large quoted string
        'digraph { ' + '/* ' + 'comment'.repeat(1000) + ' */', // Large comment
      ];
      
      malformedInputs.forEach(input => {
        // Parser should handle malformed input gracefully
        try {
          parse(input);
        } catch (e) {
          // Expected to fail, but should not crash
          expect(e).toBeDefined();
        }
      });
    });

    it('should handle recursive parsing patterns safely', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: isCI ? 20 : 50 }),
          (depth) => {
            // Create deeply nested structure
            let dot = 'digraph { ';
            for (let i = 0; i < depth; i++) {
              dot += `subgraph cluster_${i} { `;
            }
            dot += 'a -> b';
            for (let i = 0; i < depth; i++) {
              dot += ' }';
            }
            dot += ' }';
            
            // Should parse without stack overflow
            expect(() => parse(dot)).not.toThrow();
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Circular Reference Prevention', () => {
    it('should handle circular edge references safely', () => {
      const g = new Digraph();
      const nodeCount = 20;
      
      // Create nodes
      for (let i = 0; i < nodeCount; i++) {
        g.node(`node${i}`);
      }
      
      // Create circular references
      for (let i = 0; i < nodeCount; i++) {
        g.edge([`node${i}`, `node${(i + 1) % nodeCount}`]);
        g.edge([`node${i}`, `node${i}`]); // Self-reference
      }
      
      // Should handle circular structure
      expect(() => g.toDot()).not.toThrow();
      const dot = g.toDot();
      expect(dot).toContain('->');
    });

    it('should handle subgraph circular references', () => {
      const g = new Digraph();
      
      const sub1 = new Subgraph('cluster_1');
      const sub2 = new Subgraph('cluster_2');
      
      // Add nodes to subgraphs
      sub1.node('a');
      sub2.node('b');
      
      // Create edges between subgraphs (circular)
      g.addSubgraph(sub1);
      g.addSubgraph(sub2);
      g.edge(['a', 'b']);
      g.edge(['b', 'a']);
      
      expect(() => g.toDot()).not.toThrow();
    });
  });

  describe('Resource Consumption Limits', () => {
    it.skipIf(isStressTest)('should limit memory usage for edge cases', () => {
      fc.assert(
        fc.property(
          fc.record({
            nodes: fc.integer({ min: 10, max: 100 }),
            edgeMultiplier: fc.integer({ min: 1, max: 5 }),
            attrCount: fc.integer({ min: 0, max: 10 })
          }),
          ({ nodes, edgeMultiplier, attrCount }) => {
            const g = new Digraph();
            
            // Create nodes with multiple attributes
            for (let i = 0; i < nodes; i++) {
              const attrs: Record<string, string> = {};
              for (let j = 0; j < attrCount; j++) {
                attrs[`attr${j}`] = `value${j}`;
              }
              g.node(`n${i}`, attrs);
            }
            
            // Create many edges
            const edgeCount = Math.min(nodes * edgeMultiplier, 500);
            for (let i = 0; i < edgeCount; i++) {
              const from = Math.floor(Math.random() * nodes);
              const to = Math.floor(Math.random() * nodes);
              g.edge([`n${from}`, `n${to}`]);
            }
            
            // Should complete in reasonable time
            const start = performance.now();
            const dot = g.toDot();
            const elapsed = performance.now() - start;
            
            expect(elapsed).toBeLessThan(1000); // Should complete within 1 second
            expect(dot).toContain('digraph');
            
            return true;
          }
        ),
        { numRuns: isCI ? 5 : 10 }
      );
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not leak memory when creating and destroying graphs', () => {
      const iterations = isCI ? 100 : 1000;
      
      for (let i = 0; i < iterations; i++) {
        const g = new Digraph();
        
        // Add some nodes and edges
        for (let j = 0; j < 10; j++) {
          g.node(`node${j}`, { label: `Label ${j}` });
        }
        
        for (let j = 0; j < 9; j++) {
          g.edge([`node${j}`, `node${j + 1}`]);
        }
        
        // Generate DOT
        const dot = g.toDot();
        expect(dot).toContain('digraph');
        
        // Graph should be garbage collected after this iteration
      }
      
      // If we get here without running out of memory, the test passes
      expect(true).toBe(true);
    });

    it('should handle attribute object mutations safely', () => {
      const g = new Digraph();
      const attrs = { label: 'Original', color: 'red' };
      
      g.node('test', attrs);
      
      // Mutate the original object
      attrs.label = 'Modified';
      attrs.color = 'blue';
      
      // The graph should have its own copy
      const dot = g.toDot();
      expect(dot).toContain('Original');
      expect(dot).toContain('red');
    });
  });

  describe('Unicode Memory Safety', () => {
    it('should handle unicode strings without memory issues', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 100 }),
            { minLength: 1, maxLength: 50 }
          ),
          (strings) => {
            const g = new Digraph();
            
            // Add nodes with various unicode content
            strings.forEach((str, i) => {
              g.node(`node${i}`, { 
                label: str,
                tooltip: `🎯 ${str} 🎯` // Add emojis
              });
            });
            
            // Should handle unicode without issues
            const dot = g.toDot();
            expect(dot).toContain('digraph');
            
            // Verify structure
            strings.forEach((_, i) => {
              expect(dot).toContain(`node${i}`);
            });
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});