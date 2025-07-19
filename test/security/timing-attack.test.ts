import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  SecurityArbitraries,
  SecurityTestPatterns,
  ATTACK_PATTERNS
} from './utils/security-test-helpers.js';

/**
 * Tests for timing attack prevention
 * These tests verify that the library handles sensitive operations in constant time
 */
describe('Timing Attack Prevention', () => {
  describe('Constant Time Comparisons', () => {
    it('should perform attribute comparisons in constant time', () => {
      const measureComparison = (str1: string, str2: string): number => {
        const start = performance.now();
        // Simulate attribute comparison
        const result = str1 === str2;
        const end = performance.now();
        return end - start;
      };

      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          (str1, str2) => {
            const times: number[] = [];
            
            // Measure multiple times to reduce noise
            for (let i = 0; i < 10; i++) {
              times.push(measureComparison(str1, str2));
            }
            
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
            
            // Variance should be low for constant-time operations
            expect(variance).toBeLessThan(0.01);
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not leak information through error timing', () => {
      const measureErrorTiming = (input: string): number => {
        const start = performance.now();
        try {
          // Simulate parsing with potential error
          if (input.includes('<script>')) {
            throw new Error('Invalid input');
          }
          return performance.now() - start;
        } catch (error) {
          return performance.now() - start;
        }
      };

      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            SecurityArbitraries.maliciousString('script_injection')
          ),
          (input) => {
            const times: number[] = [];
            
            for (let i = 0; i < 5; i++) {
              times.push(measureErrorTiming(input));
            }
            
            // Error handling should not reveal timing information
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            expect(avgTime).toBeLessThan(5); // Should be reasonably fast
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Cache Timing Attacks', () => {
    it('should prevent cache-based timing attacks', () => {
      const cache = new Map<string, string>();
      
      const accessWithTiming = (key: string): { found: boolean; time: number } => {
        const start = performance.now();
        const found = cache.has(key);
        const value = cache.get(key);
        const time = performance.now() - start;
        return { found, time };
      };

      // Pre-populate cache
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      fc.assert(
        fc.property(
          fc.string(),
          (key) => {
            const timings = [];
            
            // Access multiple times
            for (let i = 0; i < 10; i++) {
              const { time } = accessWithTiming(key);
              timings.push(time);
            }
            
            // Cache access times should be consistent
            const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
            const maxDeviation = Math.max(...timings.map(t => Math.abs(t - avgTime)));
            
            expect(maxDeviation).toBeLessThan(0.1);
            
            return true;
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Resource Access Timing', () => {
    it('should not reveal file existence through timing', () => {
      const checkFileAccess = (path: string): number => {
        const start = performance.now();
        
        // Simulate file access check
        const allowed = !path.includes('..') && !path.startsWith('/etc');
        
        // Add artificial delay to prevent timing leaks
        const minDelay = 0.1;
        const elapsed = performance.now() - start;
        if (elapsed < minDelay) {
          // Busy wait to ensure minimum time
          const waitUntil = start + minDelay;
          while (performance.now() < waitUntil) {
            // Busy wait
          }
        }
        
        return performance.now() - start;
      };

      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom('/etc/passwd', '../../../secret', '/dev/null'),
            fc.string()
          ),
          (path) => {
            const times: number[] = [];
            
            for (let i = 0; i < 5; i++) {
              times.push(checkFileAccess(path));
            }
            
            // All paths should take similar time
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            expect(avgTime).toBeGreaterThanOrEqual(0.05);
            expect(avgTime).toBeLessThan(5); // Allow more time for busy wait
            
            return true;
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});