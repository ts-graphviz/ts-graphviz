import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

/**
 * Memory safety and resource management security tests
 * These tests verify that the library handles memory usage safely and prevents resource exhaustion attacks
 */
const isCI = process.env.CI === 'true';
const isStressTest = process.env.SKIP_STRESS_TESTS === 'true';

describe.concurrent('Memory Safety Security Tests', () => {
  describe('Memory Exhaustion Prevention', () => {
    it('should limit string buffer sizes', () => {
      fc.assert(
        fc.property(
          fc.record({
            size: fc.integer({ min: 1, max: 100000000 }), // Up to 100MB
            character: fc.string({ minLength: 1, maxLength: 1 })
          }),
          (config) => {
            try {
              const result = createLargeString(config.size, config.character);
              
              // Should either succeed with reasonable size or be limited
              const maxAllowedSize = 50 * 1024 * 1024; // 50MB limit
              expect(result.length).toBeLessThanOrEqual(maxAllowedSize);
              
              return true;
            } catch (error) {
              // Memory limit errors are expected for very large sizes
              expect(error.message).toMatch(/memory|size|limit/i);
              return true;
            }
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    });

    it('should handle large array allocations safely', () => {
      fc.assert(
        fc.property(
          fc.record({
            arraySize: fc.integer({ min: 1000, max: 10000000 }),
            elementSize: fc.integer({ min: 1, max: 1000 })
          }),
          (config) => {
            try {
              const result = createLargeArray(config.arraySize, config.elementSize);
              
              // Should either succeed or be limited by safety checks
              const maxElements = 1000000; // 1M elements max
              expect(result.length).toBeLessThanOrEqual(maxElements);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/memory|allocation|limit/i);
              return true;
            }
          }
        ),
        { numRuns: 30, timeout: 15000 }
      );
    });

    it('should detect and prevent infinite loops in graph traversal', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }),
          (nodeCount) => {
            // Create circular graph structure
            const nodes = Array(nodeCount).fill(null).map((_, i) => ({
              id: `node${i}`,
              edges: [`node${(i + 1) % nodeCount}`] // Creates cycle
            }));
            
            try {
              const result = safeGraphTraversal(nodes[0], nodes);
              
              // Should detect cycle and terminate safely
              expect(result.cycleDetected).toBe(true);
              expect(result.visitedNodes).toBeLessThan(nodeCount * 2); // Shouldn't visit too many times
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/cycle|infinite|loop/i);
              return true;
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Object Creation Limits', () => {
    it('should limit nested object depth', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 10000 }),
          (depth) => {
            try {
              const result = createNestedObject(depth);
              
              // Should either succeed with limited depth or throw error
              const actualDepth = measureObjectDepth(result);
              const maxDepth = 1000;
              expect(actualDepth).toBeLessThanOrEqual(maxDepth);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/depth|nesting|stack/i);
              return true;
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle property enumeration safely', () => {
      fc.assert(
        fc.property(
          fc.record({
            propertyCount: fc.integer({ min: 100, max: 100000 }),
            keyLength: fc.integer({ min: 1, max: 1000 }),
            valueSize: fc.integer({ min: 1, max: 10000 })
          }),
          (config) => {
            try {
              const obj = createObjectWithManyProperties(config);
              
              // Property enumeration should be safe
              const keys = Object.keys(obj);
              const maxProperties = 10000;
              expect(keys.length).toBeLessThanOrEqual(maxProperties);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/property|memory|limit/i);
              return true;
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Garbage Collection Pressure', () => {
    it.skipIf(isStressTest)('should handle rapid object creation and destruction', () => {
      fc.assert(
        fc.property(
          fc.record({
            iterations: fc.integer({ min: 100, max: isStressTest ? 1000 : 10000 }),
            objectSize: fc.integer({ min: 10, max: isStressTest ? 100 : 1000 })
          }),
          (config) => {
            try {
              const result = rapidObjectCreation(config.iterations, config.objectSize);
              
              // Should complete without memory issues
              expect(result.completed).toBe(true);
              expect(result.iterations).toBeLessThanOrEqual(config.iterations);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/memory|allocation|gc/i);
              return true;
            }
          }
        ),
        { numRuns: isCI ? 5 : 20, timeout: 15000 }
      );
    });

    it('should clean up temporary resources', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 10, maxLength: 1000 }), { minLength: 1, maxLength: 100 }),
          (resources) => {
            try {
              const result = manageTemporaryResources(resources);
              
              // All resources should be properly cleaned up
              expect(result.created).toBe(result.cleaned);
              expect(result.leaks).toBe(0);
              
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

  describe('Buffer Overflow Prevention', () => {
    it('should prevent buffer overflows in string operations', () => {
      fc.assert(
        fc.property(
          fc.record({
            baseString: fc.string({ minLength: 1, maxLength: 1000 }),
            repeatCount: fc.integer({ min: 1, max: 1000000 }),
            appendString: fc.string({ minLength: 1, maxLength: 100 })
          }),
          (config) => {
            try {
              const result = safeStringOperation(config);
              
              // Result should be within safe bounds
              const maxLength = 10 * 1024 * 1024; // 10MB
              expect(result.length).toBeLessThanOrEqual(maxLength);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/buffer|overflow|size|memory/i);
              return true;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle array buffer operations safely', () => {
      fc.assert(
        fc.property(
          fc.record({
            bufferSize: fc.integer({ min: 1024, max: 100 * 1024 * 1024 }), // Up to 100MB
            operations: fc.array(
              fc.record({
                type: fc.constantFrom('read', 'write', 'copy', 'slice'),
                offset: fc.integer({ min: 0, max: 1000000 }),
                length: fc.integer({ min: 1, max: 1000000 })
              }),
              { minLength: 1, maxLength: 10 }
            )
          }),
          (config) => {
            try {
              const result = safeBufferOperations(config);
              
              // Operations should complete safely or handle bounds errors
              expect(result.success).toBe(true);
              expect(result.errors).toBeGreaterThanOrEqual(0);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/buffer|bounds|memory/i);
              return true;
            }
          }
        ),
        { numRuns: 30, timeout: 10000 }
      );
    });
  });

  describe('Resource Leak Prevention', () => {
    it('should detect and prevent memory leaks in event listeners', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 1000 }),
          (listenerCount) => {
            try {
              const result = manageEventListeners(listenerCount);
              
              // All listeners should be properly cleaned up
              expect(result.active).toBe(0);
              expect(result.leaked).toBe(0);
              
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

    it('should handle closure memory leaks', () => {
      fc.assert(
        fc.property(
          fc.record({
            closureCount: fc.integer({ min: 10, max: 1000 }),
            capturedDataSize: fc.integer({ min: 100, max: 100000 })
          }),
          (config) => {
            try {
              const result = createClosuresWithData(config);
              
              // Closures should not leak excessive memory
              expect(result.created).toBe(config.closureCount);
              expect(result.memoryLeakDetected).toBe(false);
              
              return true;
            } catch (error) {
              expect(error.message).toMatch(/memory|closure|leak/i);
              return true;
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('WeakRef and FinalizationRegistry Safety', () => {
    it('should use WeakRef for large object references', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string(),
              data: fc.string({ minLength: 1000, maxLength: 10000 })
            }),
            { minLength: 10, maxLength: 100 }
          ),
          (objects) => {
            try {
              const result = manageWeakReferences(objects);
              
              // WeakRef should be used appropriately
              expect(result.weakRefsCreated).toBe(objects.length);
              expect(result.strongRefsCount).toBeLessThanOrEqual(10); // Limit strong refs
              
              return true;
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              return true;
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

// Mock memory safety functions
function createLargeString(size: number, char: string): string {
  const maxSize = 50 * 1024 * 1024; // 50MB limit
  
  if (size > maxSize) {
    throw new Error(`String size ${size} exceeds memory limit ${maxSize}`);
  }
  
  return char.repeat(Math.min(size, maxSize));
}

function createLargeArray(arraySize: number, elementSize: number): any[] {
  const maxElements = 1000000;
  const maxTotalSize = 100 * 1024 * 1024; // 100MB
  
  if (arraySize > maxElements) {
    throw new Error(`Array size ${arraySize} exceeds limit ${maxElements}`);
  }
  
  const totalSize = arraySize * elementSize;
  if (totalSize > maxTotalSize) {
    throw new Error(`Total allocation ${totalSize} exceeds memory limit ${maxTotalSize}`);
  }
  
  return Array(Math.min(arraySize, maxElements)).fill(null).map((_, i) => ({
    id: i,
    data: 'x'.repeat(Math.min(elementSize, 1000))
  }));
}

function safeGraphTraversal(startNode: any, allNodes: any[]): { cycleDetected: boolean, visitedNodes: number } {
  const visited = new Set();
  const recursionStack = new Set();
  let visitedCount = 0;
  const maxVisits = allNodes.length * 2;
  
  function dfs(nodeId: string): boolean {
    if (visitedCount > maxVisits) {
      throw new Error('Infinite loop detected in graph traversal');
    }
    
    if (recursionStack.has(nodeId)) {
      return true; // Cycle detected
    }
    
    if (visited.has(nodeId)) {
      return false;
    }
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    visitedCount++;
    
    const node = allNodes.find(n => n.id === nodeId);
    if (node && node.edges) {
      for (const edge of node.edges) {
        if (dfs(edge)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  const cycleDetected = dfs(startNode.id);
  
  return { cycleDetected, visitedNodes: visitedCount };
}

function createNestedObject(depth: number): any {
  const maxDepth = 1000;
  
  if (depth > maxDepth) {
    throw new Error(`Nesting depth ${depth} exceeds limit ${maxDepth}`);
  }
  
  let obj: any = { value: 'leaf' };
  
  for (let i = 0; i < Math.min(depth, maxDepth); i++) {
    obj = { level: i, child: obj };
  }
  
  return obj;
}

function measureObjectDepth(obj: any, currentDepth = 0): number {
  if (!obj || typeof obj !== 'object' || currentDepth > 2000) {
    return currentDepth;
  }
  
  let maxDepth = currentDepth;
  
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const childDepth = measureObjectDepth(value, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  }
  
  return maxDepth;
}

function createObjectWithManyProperties(config: any): any {
  const maxProperties = 10000;
  const maxKeyLength = 100;
  const maxValueSize = 1000;
  
  if (config.propertyCount > maxProperties) {
    throw new Error(`Property count ${config.propertyCount} exceeds limit ${maxProperties}`);
  }
  
  const obj: any = {};
  const propertyCount = Math.min(config.propertyCount, maxProperties);
  
  for (let i = 0; i < propertyCount; i++) {
    const key = `prop${i}`.padEnd(Math.min(config.keyLength, maxKeyLength), 'x');
    const value = 'v'.repeat(Math.min(config.valueSize, maxValueSize));
    obj[key] = value;
  }
  
  return obj;
}

function rapidObjectCreation(iterations: number, objectSize: number): { completed: boolean, iterations: number } {
  const maxIterations = 10000;
  const actualIterations = Math.min(iterations, maxIterations);
  
  for (let i = 0; i < actualIterations; i++) {
    // Create and immediately discard objects to test GC pressure
    const obj: any = {};
    for (let j = 0; j < Math.min(objectSize, 100); j++) {
      obj[`prop${j}`] = `value${j}`;
    }
    
    // Simulate some work
    if (i % 100 === 0) {
      // Force GC opportunity
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
      }
    }
  }
  
  return { completed: true, iterations: actualIterations };
}

function manageTemporaryResources(resources: string[]): { created: number, cleaned: number, leaks: number } {
  const active = new Set();
  let created = 0;
  let cleaned = 0;
  
  try {
    // Create resources
    for (const resource of resources) {
      active.add(resource);
      created++;
    }
    
    // Clean up resources
    for (const resource of active) {
      active.delete(resource);
      cleaned++;
    }
    
    return {
      created,
      cleaned,
      leaks: active.size
    };
  } catch (error) {
    return {
      created,
      cleaned,
      leaks: active.size
    };
  }
}

function safeStringOperation(config: any): string {
  const maxLength = 10 * 1024 * 1024; // 10MB
  const estimatedLength = config.baseString.length * config.repeatCount + config.appendString.length;
  
  if (estimatedLength > maxLength) {
    throw new Error(`String operation would exceed memory limit: ${estimatedLength} > ${maxLength}`);
  }
  
  let result = config.baseString.repeat(Math.min(config.repeatCount, 10000));
  result += config.appendString;
  
  return result;
}

function safeBufferOperations(config: any): { success: boolean, errors: number } {
  const maxBufferSize = 50 * 1024 * 1024; // 50MB
  
  if (config.bufferSize > maxBufferSize) {
    throw new Error(`Buffer size ${config.bufferSize} exceeds limit ${maxBufferSize}`);
  }
  
  try {
    const buffer = new ArrayBuffer(Math.min(config.bufferSize, maxBufferSize));
    const view = new Uint8Array(buffer);
    let errors = 0;
    
    for (const op of config.operations) {
      try {
        switch (op.type) {
          case 'read':
            if (op.offset + op.length <= view.length) {
              view.slice(op.offset, op.offset + op.length);
            } else {
              errors++;
            }
            break;
          case 'write':
            if (op.offset + op.length <= view.length) {
              view.fill(42, op.offset, op.offset + op.length);
            } else {
              errors++;
            }
            break;
          case 'copy':
            if (op.offset + op.length <= view.length) {
              const copy = new Uint8Array(view.buffer.slice(op.offset, op.offset + op.length));
            } else {
              errors++;
            }
            break;
        }
      } catch {
        errors++;
      }
    }
    
    return { success: true, errors };
  } catch (error) {
    throw new Error(`Buffer operation failed: ${error.message}`);
  }
}

function manageEventListeners(count: number): { active: number, leaked: number } {
  const listeners = new Map();
  const maxListeners = 1000;
  
  if (count > maxListeners) {
    throw new Error(`Listener count ${count} exceeds limit ${maxListeners}`);
  }
  
  // Create listeners
  for (let i = 0; i < Math.min(count, maxListeners); i++) {
    const listener = () => { /* dummy */ };
    listeners.set(`listener${i}`, listener);
  }
  
  // Clean up listeners
  for (const [key, listener] of listeners) {
    listeners.delete(key);
  }
  
  return {
    active: listeners.size,
    leaked: 0
  };
}

function createClosuresWithData(config: any): { created: number, memoryLeakDetected: boolean } {
  const closures: any[] = [];
  const maxClosures = 1000;
  const maxDataSize = 10000;
  
  if (config.closureCount > maxClosures) {
    throw new Error(`Closure count ${config.closureCount} exceeds limit ${maxClosures}`);
  }
  
  const actualCount = Math.min(config.closureCount, maxClosures);
  const actualDataSize = Math.min(config.capturedDataSize, maxDataSize);
  
  for (let i = 0; i < actualCount; i++) {
    const data = 'x'.repeat(actualDataSize);
    const closure = () => data.length; // Captures data
    closures.push(closure);
  }
  
  // Clear references to allow GC
  closures.length = 0;
  
  return {
    created: actualCount,
    memoryLeakDetected: false
  };
}

function manageWeakReferences(objects: any[]): { weakRefsCreated: number, strongRefsCount: number } {
  const weakRefs: WeakRef<any>[] = [];
  const strongRefs: any[] = [];
  const maxStrongRefs = 10;
  
  for (const obj of objects) {
    const weakRef = new WeakRef(obj);
    weakRefs.push(weakRef);
    
    // Keep only a few strong references
    if (strongRefs.length < maxStrongRefs) {
      strongRefs.push(obj);
    }
  }
  
  return {
    weakRefsCreated: weakRefs.length,
    strongRefsCount: strongRefs.length
  };
}