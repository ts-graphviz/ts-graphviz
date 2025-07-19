/**
 * Test data caching utilities for performance optimization
 * Helps reduce test execution time by caching expensive test data generation
 */

interface CacheEntry<T> {
  data: T;
  created: number;
  hits: number;
}

export class TestDataCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize = 100, ttl = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get or create cached test data
   */
  getOrCreate(key: string, factory: () => T): T {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (entry && (now - entry.created) < this.ttl) {
      entry.hits++;
      return entry.data;
    }

    // Create new entry
    const data = factory();
    this.set(key, data);
    return data;
  }

  /**
   * Set cached data
   */
  private set(key: string, data: T): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      created: Date.now(),
      hits: 0
    });
  }

  /**
   * Find the oldest cache entry
   */
  private findOldestEntry(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.created < oldestTime) {
        oldestTime = entry.created;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; hits: number; entries: string[] } {
    let totalHits = 0;
    const entries: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      totalHits += entry.hits;
      entries.push(key);
    }

    return {
      size: this.cache.size,
      hits: totalHits,
      entries
    };
  }
}

// Global caches for different test data types
export const astCache = new TestDataCache();
export const graphCache = new TestDataCache();
export const maliciousInputCache = new TestDataCache();

/**
 * Generate large AST with caching
 */
export function getCachedLargeAST(nodeCount: number): any {
  const key = `large-ast-${nodeCount}`;
  
  return astCache.getOrCreate(key, () => ({
    type: 'Graph',
    children: Array(nodeCount).fill(null).map((_, i) => ({
      type: 'Node',
      id: `node${i}`,
      value: `value${i}`
    }))
  }));
}

/**
 * Generate deeply nested structure with caching
 */
export function getCachedNestedStructure(depth: number): string {
  const key = `nested-${depth}`;
  
  return graphCache.getOrCreate(key, () => {
    let result = 'digraph G { ';
    for (let i = 0; i < depth; i++) {
      result += `subgraph cluster_${i} { `;
    }
    result += 'a -> b;';
    for (let i = 0; i < depth; i++) {
      result += ' }';
    }
    result += ' }';
    return result;
  });
}

/**
 * Generate large graph with many nodes
 */
export function getCachedLargeGraph(nodeCount: number): string {
  const key = `large-graph-${nodeCount}`;
  
  return graphCache.getOrCreate(key, () => {
    let dotString = 'digraph G { ';
    for (let i = 0; i < nodeCount; i++) {
      dotString += `node${i} -> node${(i + 1) % nodeCount}; `;
    }
    dotString += '}';
    return dotString;
  });
}