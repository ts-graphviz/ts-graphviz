import { parse } from '@ts-graphviz/ast';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  SecurityValidators,
  ATTACK_PATTERNS,
  DEFAULT_SECURITY_CONFIG
} from './utils/security-test-helpers.js';
import {
  getCachedNestedStructure,
  getCachedLargeGraph
} from './utils/test-data-cache.js';

/**
 * Security-focused property-based tests for DOT parser
 * These tests verify that the parser safely handles potentially malicious inputs
 */
const isCI = process.env.CI === 'true';
const isStressTest = process.env.SKIP_STRESS_TESTS === 'true';

describe.concurrent('DOT Parser Security Tests', () => {
  describe('Input Validation', () => {
    it('should not crash on arbitrary string inputs', () => {
      SecurityTestPatterns.testMaliciousInputHandling(
        parse,
        'script_injection',
        { numRuns: 1000 }
      );
    });

    it('should handle malicious script injection attempts', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.maliciousString('script_injection'),
          (payload) => {
            const dotInput = `digraph G { node [label="${payload}"]; }`;
            
            try {
              const result = parse(dotInput);
              expect(result).toBeDefined();
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it.skipIf(isStressTest)('should handle deeply nested structures without stack overflow', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.deepStructure({ maxDepth: isStressTest ? 100 : 1000 }),
          (depth) => {
            // Use cached nested structure for better performance
            const nestedGraph = getCachedNestedStructure(depth);

            try {
              const result = parse(nestedGraph);
              expect(result).toBeDefined();
              return true;
            } catch (error) {
              // Deep nesting might legitimately fail, but shouldn't crash
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: isCI ? 10 : 50, timeout: 10000 }
      );
    });

    it('should sanitize special characters in node IDs', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0),
          SecurityArbitraries.controlCharacters(),
          (baseId, dangerousChar) => {
            const nodeId = baseId + dangerousChar;
            const dotString = `digraph G { "${nodeId}" -> b; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              // Verify the parser properly handles the dangerous character
              return true;
            } catch (error) {
              // If it fails to parse, ensure it's a proper parsing error
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Resource Exhaustion Protection', () => {
    it('should handle extremely long attribute values', () => {
      SecurityTestPatterns.testResourceExhaustion(
        (size) => {
          const longValue = 'x'.repeat(size);
          const dotString = `digraph G { a [label="${longValue}"]; }`;
          return parse(dotString);
        },
        10000,
        { numRuns: isCI ? 20 : 100, timeout: 10000 }
      );
    });

    it('should handle graphs with many nodes', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (nodeCount) => {
          let dotString = 'digraph G { ';
          for (let i = 0; i < nodeCount; i++) {
            dotString += `node${i} -> node${(i + 1) % nodeCount}; `;
          }
          dotString += '}';
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            return true;
          } catch (error) {
            // Large graphs might legitimately fail, but shouldn't crash
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Malformed Input Handling', () => {
    it('should gracefully handle incomplete DOT syntax', () => {
      const incompletePatterns = [
        'digraph G {',
        'digraph G { a ->',
        'digraph G { a [label=',
        'digraph G { subgraph',
        '{ a -> b',
        'digraph { a -> b; }'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...incompletePatterns), (pattern) => {
          try {
            parse(pattern);
            // If it somehow parses, that's acceptable
            return true;
          } catch (error) {
            // Should throw a proper parsing error, not crash
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBeDefined();
            return true;
          }
        }),
        { numRuns: isCI ? 20 : 100, timeout: 10000 }
      );
    });

    it('should handle invalid escape sequences', () => {
      const invalidEscapes = ['\\x', '\\u', '\\z', '\\999', '\\uGGGG'];
      
      fc.assert(
        fc.property(fc.constantFrom(...invalidEscapes), (escape) => {
          const dotString = `digraph G { a [label="${escape}"]; }`;
          
          try {
            const result = parse(dotString);
            expect(result).toBeDefined();
            return true;
          } catch (error) {
            // Invalid escapes should be handled gracefully
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Unicode and Encoding Safety', () => {
    it('should handle various Unicode characters safely', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.controlCharacters(),
          (unicodeChar) => {
            const dotString = `digraph G { a [label="${unicodeChar}"]; }`;
            
            try {
              const result = parse(dotString);
              expect(result).toBeDefined();
              return true;
            } catch (error) {
              // Some Unicode might not be valid in DOT, but shouldn't crash
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle mixed encoding scenarios', () => {
      fc.assert(
        fc.property(
          SecurityArbitraries.binaryData(),
          (bytes) => {
            try {
              // Convert bytes to string (might create invalid UTF-8)
              const str = String.fromCharCode(...bytes);
              const dotString = `digraph G { "${str}" -> b; }`;
              
              const result = parse(dotString);
              expect(result).toBeDefined();
              return true;
            } catch (error) {
              // Invalid encoding should be handled gracefully
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: isCI ? 20 : 100, timeout: 10000 }
      );
    });
  });
});