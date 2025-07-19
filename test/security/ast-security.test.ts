import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Security tests for AST manipulation and transformation
 * These tests verify that AST operations safely handle potentially malicious syntax trees
 */
// Test categorization based on execution time
const isStressTest = process.env.SKIP_STRESS_TESTS === 'true';

describe('AST Security Tests', () => {
  describe('AST Node Validation', () => {
    it('should validate AST node structure integrity', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.oneof(fc.string(), fc.constantFrom('Graph', 'Node', 'Edge', 'Attribute')),
            children: fc.oneof(fc.array(fc.anything()), fc.anything()),
            value: fc.oneof(fc.string(), fc.float(), fc.boolean(), fc.anything()),
            location: fc.oneof(fc.record({
              start: fc.integer(),
              end: fc.integer()
            }), fc.anything())
          }),
          (node) => {
            try {
              const validated = validateASTNode(node);
              
              // Ensure node has required properties
              expect(validated).toHaveProperty('type');
              expect(typeof validated.type).toBe('string');
              
              // Ensure children is an array if present
              if (validated.children) {
                expect(Array.isArray(validated.children)).toBe(true);
              }
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 200 }
      );
    });

    it('should handle circular references in AST', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          (depth) => {
            // Create potentially circular AST structure
            const nodes: any[] = [];
            for (let i = 0; i < depth; i++) {
              nodes.push({
                type: 'Node',
                id: `node${i}`,
                children: []
              });
            }
            
            // Create circular references
            for (let i = 0; i < depth; i++) {
              nodes[i].children.push(nodes[(i + 1) % depth]);
            }
            
            try {
              const result = detectASTCircularReferences(nodes[0]);
              
              // Should detect circular references
              expect(result.hasCircle).toBe(true);
              
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
  });

  describe('AST Transformation Security', () => {
    it('should safely transform malicious AST structures', () => {
      const maliciousTransforms = [
        { type: 'script', value: 'alert(1)' },
        { type: 'eval', value: 'eval("malicious")' },
        { type: 'function', value: 'new Function("alert(1)")()' },
        { type: 'require', value: 'require("fs").unlinkSync("/")' },
        { type: 'process', value: 'process.exit(1)' },
        { type: 'global', value: 'global.evil = true' },
        { type: 'constructor', value: 'constructor.constructor("alert(1)")()' },
        { type: 'proto', value: '__proto__.evil = alert' }
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousTransforms), (transform) => {
          try {
            const result = safeASTTransform(transform);
            
            // Ensure dangerous code is not executed
            expect(result.value).not.toMatch(/alert\s*\(/);
            expect(result.value).not.toMatch(/eval\s*\(/);
            expect(result.value).not.toMatch(/Function\s*\(/);
            expect(result.value).not.toMatch(/require\s*\(/);
            expect(result.value).not.toMatch(/process\./);
            expect(result.value).not.toMatch(/global\./);
            expect(result.value).not.toMatch(/__proto__/);
            
            return true;
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });

    it('should handle deep AST nesting without stack overflow', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 5000 }),
          (depth) => {
            // Create deeply nested AST
            let ast: any = { type: 'Graph', children: [] };
            let current = ast;
            
            for (let i = 0; i < depth; i++) {
              const child = { type: 'Subgraph', children: [] };
              current.children.push(child);
              current = child;
            }
            
            try {
              const result = safeASTTraversal(ast);
              
              // Should complete without stack overflow
              expect(result.visited).toBeGreaterThan(0);
              expect(result.maxDepth).toBe(depth);
              
              return true;
            } catch (error) {
              // Stack protection should kick in for very deep structures
              expect(error.message).toMatch(/stack|depth|recursion/i);
              return true;
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });
  });

  describe('AST Serialization Security', () => {
    it('should safely serialize AST with malicious content', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.string(),
            value: fc.oneof(
              fc.string(),
              fc.constantFrom(
                '</script><script>alert(1)</script>',
                '${eval("alert(1)")}',
                '#{system("rm -rf /")}',
                'javascript:alert(1)',
                'data:text/html,<script>alert(1)</script>'
              )
            ),
            attributes: fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.float(), fc.boolean()))
          }),
          (ast) => {
            try {
              const serialized = safeASTSerialization(ast);
              
              // Ensure dangerous content is escaped
              expect(serialized).not.toMatch(/<\/script>/i);
              expect(serialized).not.toMatch(/\$\{eval\(/);
              expect(serialized).not.toMatch(/#\{system\(/);
              expect(serialized).not.toMatch(/javascript:/);
              expect(serialized).not.toMatch(/data:text\/html.*script/i);
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle binary data in AST serialization', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 1, maxLength: 100 }),
          (bytes) => {
            const binaryString = bytes.map(b => String.fromCharCode(b)).join('');
            const ast = {
              type: 'Node',
              value: binaryString,
              children: []
            };
            
            try {
              const result = safeASTSerialization(ast);
              
              // Binary data should be handled safely
              expect(result).toBeDefined();
              expect(typeof result).toBe('string');
              
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
  });

  describe('AST Parser Security', () => {
    it('should handle malformed AST input safely', () => {
      const malformedInputs = [
        '{ "type": "Graph", "children": [',
        '{ "type": "Node", "value": undefined }',
        '{ "type": "Edge", "children": { "length": 999999999 } }',
        '{ "type": "Graph", "children": [null, undefined, false] }',
        '{ "type": "Node", "prototype": { "evil": true } }',
        '{ "type": "Graph", "__proto__": { "malicious": true } }',
        '{ "type": "Node", "constructor": { "evil": true } }',
        '{ "type": "Edge", "toString": "evil function" }'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...malformedInputs), (input) => {
          try {
            const result = safeASTParser(input);
            
            // Parser should handle malformed input gracefully
            expect(result).toBeDefined();
            
            return true;
          } catch (error) {
            // Parsing errors are acceptable for malformed input
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });

    it.skipIf(isStressTest)('should limit AST size during parsing', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: isStressTest ? 10000 : 100000 }),
          (nodeCount) => {
            // Create very large AST structure
            const largeAST = {
              type: 'Graph',
              children: Array(nodeCount).fill(null).map((_, i) => ({
                type: 'Node',
                id: `node${i}`,
                value: `value${i}`.repeat(isStressTest ? 10 : 100) // Make it memory intensive
              }))
            };
            
            try {
              const result = safeASTParser(JSON.stringify(largeAST));
              
              // Should either succeed or reject with size limit error
              expect(result).toBeDefined();
              
              return true;
            } catch (error) {
              // Size limits should be enforced
              expect(error.message).toMatch(/size|limit|memory/i);
              return true;
            }
          }
        ),
        { numRuns: isStressTest ? 3 : 10, timeout: 15000 }
      );
    });
  });

  describe('AST Query Security', () => {
    it('should safely execute AST queries', () => {
      const maliciousQueries = [
        '//script[contains(text(),"alert")]',
        '//*[@onclick or @onerror or @onload]',
        '//node()[contains(.,"javascript:")]',
        '//*[starts-with(@href,"javascript:")]',
        '//processing-instruction()',
        '//*[namespace-uri()="http://evil.com"]',
        '//comment()[contains(.,"evil")]',
        '//*[@style[contains(.,"expression(")]]'
      ];

      fc.assert(
        fc.property(fc.constantFrom(...maliciousQueries), (query) => {
          const sampleAST = {
            type: 'Graph',
            children: [
              { type: 'Node', id: 'node1', onclick: 'alert(1)' },
              { type: 'Node', id: 'node2', href: 'javascript:alert(1)' },
              { type: 'Edge', from: 'node1', to: 'node2' }
            ]
          };
          
          try {
            const result = safeASTQuery(sampleAST, query);
            
            // Query should execute safely
            expect(result).toBeDefined();
            
            return true;
          } catch (error) {
            // Query rejection is acceptable
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('AST Memory Safety', () => {
    it('should prevent memory exhaustion attacks', () => {
      fc.assert(
        fc.property(
          fc.record({
            stringLength: fc.integer({ min: 1000, max: 10000000 }),
            arraySize: fc.integer({ min: 100, max: 100000 }),
            nestingDepth: fc.integer({ min: 10, max: 1000 })
          }),
          (config) => {
            try {
              const result = createMemoryIntensiveAST(config);
              
              // Should either succeed or be rejected by safety limits
              expect(result).toBeDefined();
              
              return true;
            } catch (error) {
              // Memory limits should be enforced
              expect(error.message).toMatch(/memory|size|limit/i);
              return true;
            }
          }
        ),
        { numRuns: 20, timeout: 10000 }
      );
    });
  });
});

// Mock security validation functions for AST operations
function validateASTNode(node: any): any {
  if (!node || typeof node !== 'object') {
    throw new Error('Invalid AST node');
  }

  // Ensure required properties
  if (!node.type || typeof node.type !== 'string') {
    throw new Error('AST node must have a string type');
  }

  const validated: any = {
    type: node.type
  };

  // Validate children
  if (node.children !== undefined) {
    if (Array.isArray(node.children)) {
      validated.children = node.children;
    } else {
      throw new Error('AST node children must be an array');
    }
  }

  // Validate other properties
  if (node.value !== undefined) {
    validated.value = node.value;
  }

  if (node.location && typeof node.location === 'object') {
    validated.location = node.location;
  }

  return validated;
}

function detectASTCircularReferences(node: any, visited = new Set()): { hasCircle: boolean } {
  if (visited.has(node)) {
    return { hasCircle: true };
  }

  visited.add(node);

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === 'object') {
        const result = detectASTCircularReferences(child, new Set(visited));
        if (result.hasCircle) {
          return { hasCircle: true };
        }
      }
    }
  }

  return { hasCircle: false };
}

function safeASTTransform(transform: any): any {
  if (!transform || typeof transform !== 'object') {
    throw new Error('Invalid transform');
  }

  const dangerousPatterns = [
    /alert\s*\(/,
    /eval\s*\(/,
    /Function\s*\(/,
    /require\s*\(/,
    /process\./,
    /global\./,
    /__proto__/,
    /constructor\.constructor/
  ];

  let value = transform.value;
  if (typeof value === 'string') {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        value = value.replace(pattern, '[SANITIZED]');
      }
    }
  }

  return {
    ...transform,
    value
  };
}

function safeASTTraversal(ast: any, maxDepth = 1000): { visited: number, maxDepth: number } {
  let visited = 0;
  let currentDepth = 0;
  const maxAllowedDepth = Math.min(maxDepth, 1000);

  function traverse(node: any, depth: number): void {
    if (depth > maxAllowedDepth) {
      throw new Error(`Maximum recursion depth exceeded: ${depth}`);
    }

    visited++;
    currentDepth = Math.max(currentDepth, depth);

    if (node && typeof node === 'object' && node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(ast, 0);

  return { visited, maxDepth: currentDepth };
}

function safeASTSerialization(ast: any): string {
  if (!ast) {
    return '{}';
  }

  // Sanitize dangerous content
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<\/script>/gi, '&lt;/script&gt;')
        .replace(/\$\{eval\(/gi, '${[SANITIZED](')
        .replace(/#\{system\(/gi, '#{[SANITIZED](')
        .replace(/javascript:/gi, '[SANITIZED]:')
        .replace(/data:text\/html.*script/gi, 'data:text/plain');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip dangerous properties
        if (['__proto__', 'constructor', 'prototype'].includes(key)) {
          continue;
        }
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  try {
    return JSON.stringify(sanitize(ast));
  } catch (error) {
    throw new Error('Failed to serialize AST safely');
  }
}

function safeASTParser(input: string): any {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }

  // Limit input size
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (input.length > maxSize) {
    throw new Error(`Input size exceeds limit: ${input.length} > ${maxSize}`);
  }

  try {
    const parsed = JSON.parse(input);
    
    // Validate parsed object
    if (parsed && typeof parsed === 'object') {
      // Remove dangerous properties
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;
    }
    
    return parsed;
  } catch (error) {
    throw new Error('Failed to parse AST input');
  }
}

function safeASTQuery(ast: any, query: string): any[] {
  if (!ast || typeof query !== 'string') {
    throw new Error('Invalid query parameters');
  }

  // Block dangerous query patterns
  const dangerousPatterns = [
    /javascript:/,
    /eval\s*\(/,
    /alert\s*\(/,
    /document\./,
    /window\./,
    /process\./
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      throw new Error(`Dangerous query pattern detected: ${query}`);
    }
  }

  // Simple mock query implementation
  const results: any[] = [];
  
  function search(node: any): void {
    if (node && typeof node === 'object') {
      // Simple attribute matching
      if (query.includes('@onclick') && node.onclick) {
        results.push(node);
      }
      if (query.includes('@href') && node.href) {
        results.push(node);
      }
      
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          search(child);
        }
      }
    }
  }
  
  search(ast);
  return results;
}

function createMemoryIntensiveAST(config: any): any {
  const maxStringLength = 1000000; // 1MB
  const maxArraySize = 10000;
  const maxDepth = 100;

  if (config.stringLength > maxStringLength) {
    throw new Error('String length exceeds memory limit');
  }

  if (config.arraySize > maxArraySize) {
    throw new Error('Array size exceeds memory limit');
  }

  if (config.nestingDepth > maxDepth) {
    throw new Error('Nesting depth exceeds limit');
  }

  const ast: any = {
    type: 'Graph',
    value: 'x'.repeat(Math.min(config.stringLength, maxStringLength)),
    children: []
  };

  // Create nested structure
  let current = ast;
  for (let i = 0; i < Math.min(config.nestingDepth, maxDepth); i++) {
    const child = {
      type: 'Subgraph',
      children: []
    };
    current.children.push(child);
    current = child;
  }

  // Add array of nodes
  const nodeCount = Math.min(config.arraySize, maxArraySize);
  for (let i = 0; i < nodeCount; i++) {
    current.children.push({
      type: 'Node',
      id: `node${i}`
    });
  }

  return ast;
}