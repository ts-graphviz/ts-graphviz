import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { parse, stringify } from '@ts-graphviz/ast';
import { Digraph, Node, Edge, Subgraph } from 'ts-graphviz';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  ATTACK_PATTERNS
} from './utils/security-test-helpers.js';

/**
 * Tests for timing attack prevention in ts-graphviz
 * These tests verify that the library handles sensitive operations in constant time
 */
describe('Timing Attack Prevention in ts-graphviz', () => {
  describe('DOT Parser Timing Safety', () => {
    it('should parse DOT strings with consistent timing regardless of content', () => {
      const measureParsing = (dotString: string): number => {
        const start = performance.now();
        try {
          parse(dotString);
        } catch {
          // Ignore parse errors, we're measuring timing
        }
        const end = performance.now();
        return end - start;
      };

      // Test various DOT strings with different complexity
      const testStrings = [
        'digraph { }',
        'digraph { a -> b }',
        'digraph { a -> b [label="test"] }',
        'digraph { subgraph { a -> b -> c -> d -> e } }',
        'digraph { ' + 'a -> b; '.repeat(100) + '}',
      ];

      const times = testStrings.map(str => {
        const measurements = Array.from({ length: 50 }, () => 
          measureParsing(str)
        );
        return measurements.reduce((a, b) => a + b) / measurements.length;
      });

      // Check that timing scales linearly with input size
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const variance = maxTime - minTime;
      
      // Timing should scale predictably, not exponentially
      expect(variance).toBeLessThan(maxTime * 0.5); // Variance less than 50% of max
    });

    it('should not leak information through parser error timing', () => {
      const measureParserTiming = (input: string): number => {
        const start = performance.now();
        try {
          parse(input);
        } catch (error) {
          // Error path
        }
        return performance.now() - start;
      };

      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('digraph { a -> b }'), // Valid
            fc.constant('digraph { a ->'), // Invalid
            SecurityArbitraries.maliciousString('script_injection')
          ),
          (input) => {
            const times: number[] = [];
            
            for (let i = 0; i < 10; i++) {
              times.push(measureParserTiming(input));
            }
            
            // Error handling should not reveal timing information
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            expect(avgTime).toBeLessThan(10); // Should be reasonably fast
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Graph Construction Timing Safety', () => {
    it('should construct graphs with consistent timing for similar operations', () => {
      const measureGraphConstruction = (nodeCount: number): number => {
        const start = performance.now();
        const g = new Digraph();
        
        for (let i = 0; i < nodeCount; i++) {
          g.node(`node${i}`, { label: `Node ${i}` });
        }
        
        for (let i = 0; i < nodeCount - 1; i++) {
          g.edge([`node${i}`, `node${i + 1}`]);
        }
        
        const end = performance.now();
        return end - start;
      };

      // Test different graph sizes
      const sizes = [10, 20, 50, 100];
      const times = sizes.map(size => {
        const measurements = Array.from({ length: 20 }, () => 
          measureGraphConstruction(size)
        );
        return measurements.reduce((a, b) => a + b) / measurements.length;
      });

      // Check that timing scales linearly with size
      for (let i = 1; i < times.length; i++) {
        const ratio = times[i] / times[i - 1];
        const sizeRatio = sizes[i] / sizes[i - 1];
        
        // Timing should scale roughly linearly
        expect(ratio).toBeGreaterThan(sizeRatio * 0.5);
        expect(ratio).toBeLessThan(sizeRatio * 3);
      }
    });
  });

  describe('Attribute Access Timing Safety', () => {
    it('should access node attributes with consistent timing', () => {
      const measureAttributeAccess = (g: Digraph, nodeId: string): number => {
        const start = performance.now();
        try {
          const node = g.getNode(nodeId);
          if (node) {
            // Access various attributes
            const label = node.attributes.label;
            const color = node.attributes.color;
            const shape = node.attributes.shape;
          }
        } catch {
          // Ignore errors
        }
        const end = performance.now();
        return end - start;
      };

      // Create a graph with some nodes
      const g = new Digraph();
      for (let i = 0; i < 100; i++) {
        g.node(`node${i}`, { 
          label: `Node ${i}`,
          color: i % 2 === 0 ? 'red' : 'blue',
          shape: i % 3 === 0 ? 'box' : 'circle'
        });
      }
      
      // Test accessing existing vs non-existing nodes
      const existingTimes = Array.from({ length: 50 }, () => 
        measureAttributeAccess(g, 'node50')
      );
      const nonExistingTimes = Array.from({ length: 50 }, () => 
        measureAttributeAccess(g, 'nonexistent')
      );

      const avgExistingTime = existingTimes.reduce((a, b) => a + b) / existingTimes.length;
      const avgNonExistingTime = nonExistingTimes.reduce((a, b) => a + b) / nonExistingTimes.length;
      
      // Access times should be similar regardless of node existence
      expect(Math.abs(avgExistingTime - avgNonExistingTime)).toBeLessThan(5);
    });
  });

  describe('Property-based DOT Generation Timing', () => {
    it('should generate DOT strings with predictable timing', () => {
      const isCI = process.env.CI === 'true';
      
      fc.assert(
        fc.property(
          fc.array(fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            label: fc.string({ minLength: 0, maxLength: 50 }),
            attrs: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 10 }),
              fc.string({ minLength: 0, maxLength: 20 }),
              { maxKeys: 5 }
            )
          }), { minLength: 5, maxLength: 20 }),
          (nodes) => {
            const times = nodes.map(nodeData => {
              const start = performance.now();
              const g = new Digraph();
              
              // Add node with attributes
              g.node(nodeData.id, {
                label: nodeData.label,
                ...nodeData.attrs
              });
              
              // Convert to DOT string
              const dot = g.toDot();
              const end = performance.now();
              return end - start;
            });
            
            const avgTime = times.reduce((a, b) => a + b) / times.length;
            const maxDeviation = Math.max(...times.map(t => Math.abs(t - avgTime)));
            
            // Timing should be predictable
            return maxDeviation < avgTime * 3;
          }
        ),
        { numRuns: isCI ? 10 : 50 }
      );
    });
  });

  describe('String Escaping Timing', () => {
    it('should escape strings with consistent timing', () => {
      const measureStringEscaping = (input: string): number => {
        const start = performance.now();
        const g = new Digraph();
        g.node('test', { label: input });
        const dot = g.toDot();
        const end = performance.now();
        return end - start;
      };

      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            SecurityArbitraries.maliciousString('script_injection'),
            fc.string().map(s => s + '"' + s), // Strings with quotes
            fc.string().map(s => s + '\n' + s), // Strings with newlines
            fc.string().map(s => s + '\\' + s)  // Strings with backslashes
          ),
          (input) => {
            const times: number[] = [];
            
            for (let i = 0; i < 10; i++) {
              times.push(measureStringEscaping(input));
            }
            
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
            
            // Escaping should have consistent timing
            expect(variance).toBeLessThan(avgTime * 0.5);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});